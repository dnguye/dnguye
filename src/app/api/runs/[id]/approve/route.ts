import { NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";

import { executeRun } from "@/lib/runner/engine";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({ decision: z.enum(["approve", "reject"]) });

/**
 * Approval gate for write actions. A run parked in `needs_approval` never
 * executes its proposed external action until a workspace member explicitly
 * approves it here. The decision (either way) is recorded in the audit log
 * with the approving user.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await context.params;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // RLS: this select only succeeds for workspace members.
  const { data: run, error } = await supabase
    .from("runs")
    .select("id, workspace_id, status, proposed_action")
    .eq("id", runId)
    .single();
  if (error || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (run.status !== "needs_approval") {
    return NextResponse.json(
      { error: `Run is ${run.status}, not awaiting approval` },
      { status: 409 }
    );
  }

  if (parsed.data.decision === "reject") {
    await supabase
      .from("runs")
      .update({
        status: "cancelled",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        error_message: "Proposed action rejected by reviewer",
      })
      .eq("id", runId);
    await supabase.from("audit_events").insert({
      workspace_id: run.workspace_id,
      actor_id: user.id,
      actor_type: "user",
      event_type: "approval.rejected",
      entity_type: "run",
      entity_id: runId,
      payload: { action: run.proposed_action?.title ?? null },
    });
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  await supabase
    .from("runs")
    .update({ approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", runId);
  await supabase.from("audit_events").insert({
    workspace_id: run.workspace_id,
    actor_id: user.id,
    actor_type: "user",
    event_type: "approval.granted",
    entity_type: "run",
    entity_id: runId,
    payload: { action: run.proposed_action?.title ?? null },
  });

  after(async () => {
    await executeRun(supabase, runId, { resumeApproved: true });
  });

  return NextResponse.json({ ok: true, status: "running" });
}
