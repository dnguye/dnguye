import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

const CANCELLABLE = new Set(["queued", "running", "needs_approval"]);

export async function POST(
  _request: Request,
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

  const { data: run, error } = await supabase
    .from("runs")
    .select("id, workspace_id, status")
    .eq("id", runId)
    .single();
  if (error || !run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (!CANCELLABLE.has(run.status)) {
    return NextResponse.json(
      { error: `Run already ${run.status}` },
      { status: 409 }
    );
  }

  await supabase
    .from("runs")
    .update({ status: "cancelled", finished_at: new Date().toISOString() })
    .eq("id", runId);
  await supabase.from("audit_events").insert({
    workspace_id: run.workspace_id,
    actor_id: user.id,
    actor_type: "user",
    event_type: "run.cancelled",
    entity_type: "run",
    entity_id: runId,
    payload: {},
  });

  return NextResponse.json({ ok: true });
}
