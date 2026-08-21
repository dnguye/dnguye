import { NextResponse } from "next/server";

import { computeNextRun } from "@/lib/cron";
import { executeRun } from "@/lib/runner/engine";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Scheduler entry point — designed to run with NO user session, so routines
 * fire independently of anyone's browser.
 *
 * Invoke it from any external scheduler on a fixed cadence (every 1-5 min):
 *
 *   - Netlify Scheduled Functions (see netlify/functions/routine-tick.mts)
 *   - GitHub Actions cron, Supabase pg_cron + pg_net, cron-job.org, ...
 *
 *   curl -X POST https://<site>/api/jobs/execute-routine \
 *        -H "Authorization: Bearer $CRON_SECRET"
 *
 * Auth: shared-secret `CRON_SECRET` (never exposed to clients).
 * Data access: SUPABASE_SERVICE_ROLE_KEY (server env only) — the job scans
 * all workspaces for due routines, which RLS-scoped clients cannot do.
 *
 * Body (optional): { "routine_id": "<uuid>" } to force-run one routine now.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    routine_id?: string;
  };

  const now = new Date();
  let query = supabase
    .from("routines")
    .select("*")
    .eq("enabled", true)
    .limit(10);
  query = body.routine_id
    ? query.eq("id", body.routine_id)
    : query.lte("next_run_at", now.toISOString());

  const { data: due, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{ routine_id: string; run_id?: string; error?: string }> = [];

  for (const routine of due ?? []) {
    try {
      if (!routine.agent_id) throw new Error("Routine has no agent");

      const { data: agent } = await supabase
        .from("agents")
        .select("model, default_effort")
        .eq("id", routine.agent_id)
        .single();

      const { data: run, error: runError } = await supabase
        .from("runs")
        .insert({
          workspace_id: routine.workspace_id,
          agent_id: routine.agent_id,
          skill_id: routine.skill_id,
          routine_id: routine.id,
          status: "queued",
          input:
            routine.approval_policy === "require_approval"
              ? { ...routine.input, __require_approval: true }
              : routine.input,
          model: agent?.model ?? "simulated-large",
          effort: agent?.default_effort ?? "medium",
        })
        .select("id")
        .single();
      if (runError || !run) throw new Error(runError?.message ?? "insert failed");

      await supabase.from("audit_events").insert({
        workspace_id: routine.workspace_id,
        actor_type: "system",
        event_type: "routine.fired",
        entity_type: "routine",
        entity_id: routine.id,
        payload: { name: routine.name, run_id: run.id },
      });

      await supabase
        .from("routines")
        .update({
          last_run_at: now.toISOString(),
          next_run_at:
            computeNextRun(routine.schedule_cron, routine.timezone, now)?.toISOString() ??
            null,
        })
        .eq("id", routine.id);

      // Simulated runs are short; execute inline so the scheduler response
      // reflects the outcome. A real provider would enqueue to a worker here.
      await executeRun(supabase, run.id as string);

      results.push({ routine_id: routine.id, run_id: run.id as string });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      results.push({ routine_id: routine.id, error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
