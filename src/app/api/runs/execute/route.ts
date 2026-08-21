import { NextResponse } from "next/server";
import { after } from "next/server";

import { executeRun } from "@/lib/runner/engine";
import { executeRunSchema } from "@/lib/schemas";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Queue a run and execute it with the agent's provider adapter.
 *
 * Uses the caller's session (RLS enforces workspace membership). The response
 * returns immediately with the run id; execution continues via `after()` and
 * progress streams to clients through Supabase Realtime on the runs table.
 */
export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = executeRunSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 }
    );
  }
  const payload = parsed.data;

  // Resolve agent defaults; the select also proves workspace membership (RLS).
  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("id, workspace_id, model, default_effort, name")
    .eq("id", payload.agent_id)
    .eq("workspace_id", payload.workspace_id)
    .single();
  if (agentError || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const { data: run, error } = await supabase
    .from("runs")
    .insert({
      workspace_id: payload.workspace_id,
      agent_id: payload.agent_id,
      skill_id: payload.skill_id ?? null,
      routine_id: payload.routine_id ?? null,
      status: "queued",
      input: payload.input ?? {},
      model: payload.model ?? agent.model,
      effort: payload.effort ?? agent.default_effort,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !run) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create run" },
      { status: 500 }
    );
  }

  await supabase.from("audit_events").insert({
    workspace_id: payload.workspace_id,
    actor_id: user.id,
    actor_type: "user",
    event_type: "run.queued",
    entity_type: "run",
    entity_id: run.id,
    payload: { agent: agent.name },
  });

  after(async () => {
    await executeRun(supabase, run.id as string);
  });

  return NextResponse.json({ run_id: run.id }, { status: 202 });
}
