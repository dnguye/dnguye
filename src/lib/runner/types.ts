import type { Agent, Json, ProposedAction, Skill } from "@/lib/types";

/**
 * Provider adapter contract.
 *
 * The app ships with a `SimulatedAdapter` for development. To integrate a
 * real model provider (Anthropic, OpenAI, a local runner, ...):
 *
 *   1. Implement `ProviderAdapter` (see simulated.ts for the reference shape).
 *   2. Register it in registry.ts under the provider id you use on agents
 *      (the `agents.provider` column).
 *   3. Keep provider API keys in server-side env vars only — adapters are
 *      imported exclusively from API routes, never from client components.
 *
 * The engine (engine.ts) owns all persistence: adapters just produce steps,
 * output, and optional artifacts/proposed actions. That keeps run state,
 * approvals, and audit logging identical across providers.
 */

export interface RunRequest {
  runId: string;
  agent: Agent;
  skill: Skill | null;
  input: Record<string, Json>;
  model: string;
  effort: string;
  /** Phase 2 of an approved write action. */
  approvedAction?: ProposedAction | null;
}

export interface AdapterEvents {
  /** Report a progress step; the engine persists it to runs.progress. */
  emitStep: (step: string, detail?: string) => Promise<void>;
  /** Check whether the run was cancelled; adapters should stop promptly. */
  isCancelled: () => Promise<boolean>;
}

export interface AdapterArtifact {
  title: string;
  type: "report" | "markdown" | "html" | "json" | "csv";
  mime_type: string;
  content: string;
  tags?: string[];
}

export type AdapterResult =
  | {
      kind: "completed";
      output: Record<string, Json>;
      artifacts: AdapterArtifact[];
      costEstimate: number;
    }
  | {
      /**
       * The adapter wants to perform an external write. The engine parks the
       * run in `needs_approval`; after a human approves, execute() is called
       * again with `approvedAction` set to finish the job.
       */
      kind: "needs_approval";
      proposedAction: ProposedAction;
      costEstimate: number;
    }
  | { kind: "cancelled" };

export interface ProviderAdapter {
  id: string;
  execute(request: RunRequest, events: AdapterEvents): Promise<AdapterResult>;
}
