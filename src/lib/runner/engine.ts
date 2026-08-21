import type { SupabaseClient } from "@supabase/supabase-js";

import type { Agent, Run, RunProgressStep, Skill } from "@/lib/types";
import { getProviderAdapter } from "./registry";
import type { AdapterArtifact } from "./types";

/**
 * The run engine drives a run through its lifecycle:
 *
 *   queued → running → succeeded | failed | cancelled
 *                    ↘ needs_approval → (approve) → running → ...
 *
 * It is provider-agnostic: all model-specific behavior lives behind the
 * ProviderAdapter interface. The engine owns persistence (progress, status,
 * artifacts) and the audit trail. It accepts any SupabaseClient — a
 * user-scoped client from API routes (RLS enforced) or the service-role
 * client from the scheduler job.
 */

async function audit(
  supabase: SupabaseClient,
  workspaceId: string,
  eventType: string,
  runId: string,
  payload: Record<string, unknown> = {}
) {
  await supabase.from("audit_events").insert({
    workspace_id: workspaceId,
    actor_id: null,
    actor_type: "agent",
    event_type: eventType,
    entity_type: "run",
    entity_id: runId,
    payload,
  });
}

async function loadRun(supabase: SupabaseClient, runId: string) {
  const { data, error } = await supabase
    .from("runs")
    .select("*, agent:agents(*), skill:skills(*)")
    .eq("id", runId)
    .single();
  if (error || !data) throw new Error(error?.message ?? "Run not found");
  return data as unknown as Run & { agent: Agent | null; skill: Skill | null };
}

async function insertArtifacts(
  supabase: SupabaseClient,
  run: Run,
  artifacts: AdapterArtifact[]
): Promise<string[]> {
  const ids: string[] = [];
  for (const artifact of artifacts) {
    const { data, error } = await supabase
      .from("artifacts")
      .insert({
        workspace_id: run.workspace_id,
        run_id: run.id,
        title: artifact.title,
        type: artifact.type,
        mime_type: artifact.mime_type,
        content_inline: artifact.content,
        metadata: { generator: "runner", model: run.model },
        searchable_text: artifact.content.slice(0, 4000),
        tags: artifact.tags ?? [],
        created_by: run.created_by,
      })
      .select("id")
      .single();
    if (!error && data) {
      ids.push(data.id as string);
      await audit(supabase, run.workspace_id, "artifact.created", run.id, {
        artifact_id: data.id,
        title: artifact.title,
      });
    }
  }
  return ids;
}

export async function executeRun(
  supabase: SupabaseClient,
  runId: string,
  options: { resumeApproved?: boolean } = {}
): Promise<void> {
  const run = await loadRun(supabase, runId);
  if (!run.agent) {
    await supabase
      .from("runs")
      .update({
        status: "failed",
        error_message: "Agent no longer exists",
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return;
  }

  const expectedStatus = options.resumeApproved ? "needs_approval" : "queued";
  if (run.status !== expectedStatus) return; // already picked up elsewhere

  const progress: RunProgressStep[] = Array.isArray(run.progress)
    ? [...run.progress]
    : [];

  await supabase
    .from("runs")
    .update({
      status: "running",
      started_at: run.started_at ?? new Date().toISOString(),
    })
    .eq("id", runId);
  await audit(supabase, run.workspace_id, options.resumeApproved ? "run.resumed" : "run.started", runId, {
    agent: run.agent.name,
    skill: run.skill?.slug ?? null,
  });

  const adapter = getProviderAdapter(run.agent.provider);

  const events = {
    emitStep: async (step: string, detail?: string) => {
      progress.push({ step, detail, at: new Date().toISOString() });
      await supabase.from("runs").update({ progress }).eq("id", runId);
    },
    isCancelled: async () => {
      const { data } = await supabase
        .from("runs")
        .select("status")
        .eq("id", runId)
        .single();
      return data?.status === "cancelled";
    },
  };

  try {
    const result = await adapter.execute(
      {
        runId,
        agent: run.agent,
        skill: run.skill,
        input: run.input ?? {},
        model: run.model ?? run.agent.model,
        effort: run.effort ?? run.agent.default_effort,
        approvedAction: options.resumeApproved ? run.proposed_action : null,
      },
      events
    );

    if (result.kind === "cancelled") {
      await supabase
        .from("runs")
        .update({ finished_at: new Date().toISOString() })
        .eq("id", runId)
        .eq("status", "cancelled");
      return;
    }

    if (result.kind === "needs_approval") {
      await supabase
        .from("runs")
        .update({
          status: "needs_approval",
          proposed_action: result.proposedAction,
          cost_estimate: result.costEstimate,
        })
        .eq("id", runId);
      await audit(supabase, run.workspace_id, "run.needs_approval", runId, {
        action: result.proposedAction.title,
        destination: result.proposedAction.destination,
      });
      return;
    }

    const artifactIds = await insertArtifacts(supabase, run, result.artifacts);
    await supabase
      .from("runs")
      .update({
        status: "succeeded",
        output: { ...result.output, artifact_ids: artifactIds },
        cost_estimate: (run.cost_estimate ?? 0) + result.costEstimate,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    await audit(supabase, run.workspace_id, "run.succeeded", runId, {
      agent: run.agent.name,
      skill: run.skill?.slug ?? null,
      cost: result.costEstimate,
      artifacts: artifactIds.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown runner error";
    await supabase
      .from("runs")
      .update({
        status: "failed",
        error_message: message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);
    await audit(supabase, run.workspace_id, "run.failed", runId, { error: message });
  }
}
