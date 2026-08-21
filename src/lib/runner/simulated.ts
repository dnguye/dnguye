import type { Json, ProposedAction } from "@/lib/types";
import type {
  AdapterArtifact,
  AdapterEvents,
  AdapterResult,
  ProviderAdapter,
  RunRequest,
} from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Development runner: streams believable progress states, produces a
 * structured mock artifact, and routes write actions through the approval
 * gate — exactly the lifecycle a real provider adapter must follow.
 */
export class SimulatedAdapter implements ProviderAdapter {
  id = "simulated";

  async execute(req: RunRequest, events: AdapterEvents): Promise<AdapterResult> {
    const stepDelay = req.effort === "low" ? 350 : req.effort === "medium" ? 550 : 800;

    // Phase 2: an approved write action — apply it and finish.
    if (req.approvedAction) {
      for (const step of ["Re-validating approved plan", "Applying changes", "Verifying results"]) {
        if (await events.isCancelled()) return { kind: "cancelled" };
        await events.emitStep(step);
        await sleep(stepDelay);
      }
      const payload = req.approvedAction.payload;
      return {
        kind: "completed",
        output: {
          applied_action: req.approvedAction.title,
          destination: req.approvedAction.destination,
          details: payload as Json,
        },
        artifacts: [
          {
            title: `${req.approvedAction.title} — execution log`,
            type: "markdown",
            mime_type: "text/markdown",
            content: [
              `# ${req.approvedAction.title}`,
              "",
              `Applied to **${req.approvedAction.destination}** after explicit approval.`,
              "",
              "```json",
              JSON.stringify(payload, null, 2),
              "```",
            ].join("\n"),
            tags: ["execution-log"],
          },
        ],
        costEstimate: round4(0.002 + Math.random() * 0.01),
      };
    }

    const isWriteSkill = this.requiresApproval(req);
    const plan = this.stepsFor(req, isWriteSkill);
    for (const step of plan) {
      if (await events.isCancelled()) return { kind: "cancelled" };
      await events.emitStep(step);
      await sleep(stepDelay);
    }

    if (isWriteSkill) {
      return {
        kind: "needs_approval",
        proposedAction: this.proposeAction(req),
        costEstimate: round4(0.001 + Math.random() * 0.008),
      };
    }

    const artifact = this.buildArtifact(req);
    return {
      kind: "completed",
      output: {
        summary: `Completed “${req.skill?.name ?? "ad-hoc task"}” with ${req.effort} effort.`,
        artifact_title: artifact.title,
        input_echo: req.input as Json,
      },
      artifacts: [artifact],
      costEstimate: round4(
        (req.effort === "low" ? 0.005 : req.effort === "medium" ? 0.02 : 0.08) *
          (0.6 + Math.random())
      ),
    };
  }

  /**
   * Any skill/agent combination that would write outside the workspace must
   * pass through human approval. Simulated heuristic: ops-category write
   * skills, or delivery to an external connection.
   */
  private requiresApproval(req: RunRequest): boolean {
    if (req.input?.__require_approval === true) return true;
    const tags = req.skill?.tags ?? [];
    if (tags.includes("ops") && req.skill?.slug !== "daily-briefing") return true;
    return false;
  }

  private proposeAction(req: RunRequest): ProposedAction {
    return {
      kind: "write",
      title: `Apply “${req.skill?.name ?? "proposed changes"}”`,
      destination: "artifact_library",
      summary:
        "The agent finished planning and wants to apply changes: archive 3 stale drafts, retag 7 artifacts, merge 1 duplicate.",
      payload: {
        archive: ["draft-note-1", "draft-note-2", "untitled-4"],
        retag: { count: 7, tag: "reviewed" },
        merge: [{ keep: "weekly-report-final", remove: "weekly-report-final-copy" }],
      },
    };
  }

  private stepsFor(req: RunRequest, isWrite: boolean): string[] {
    const category = req.skill?.category ?? "general";
    const base: Record<string, string[]> = {
      research: [
        "Breaking topic into sub-questions",
        "Gathering sources",
        "Cross-checking claims",
        "Synthesizing findings",
        "Writing summary",
      ],
      writing: [
        "Reading input material",
        "Outlining structure",
        "Drafting content",
        "Polishing tone and formatting",
      ],
      planning: [
        "Clarifying goal and constraints",
        "Drafting phases and milestones",
        "Assessing risks",
        "Producing schedule",
      ],
      operations: [
        "Collecting workspace activity",
        "Analyzing recent runs and artifacts",
        "Preparing report",
      ],
      general: ["Reading instructions", "Working on task", "Preparing output"],
    };
    const steps = base[category] ?? base.general;
    return isWrite
      ? [...steps.slice(0, 2), "Building change plan", "Requesting approval for write action"]
      : steps;
  }

  private buildArtifact(req: RunRequest): AdapterArtifact {
    const title = req.skill
      ? `${req.skill.name} — ${new Date().toISOString().slice(0, 10)}`
      : `Agent output — ${new Date().toISOString().slice(0, 10)}`;
    const inputPretty = JSON.stringify(req.input ?? {}, null, 2);
    return {
      title,
      type: "markdown",
      mime_type: "text/markdown",
      content: [
        `# ${title}`,
        "",
        `> Generated by **${req.agent.name}** (simulated provider, model \`${req.model}\`, effort \`${req.effort}\`).`,
        "",
        "## Summary",
        req.skill?.description || "Ad-hoc run executed by the simulated provider.",
        "",
        "## Details",
        "This is a structured mock output. Swap the simulated provider for a real",
        "adapter in `src/lib/runner/registry.ts` to produce genuine results — the",
        "run lifecycle, approvals, artifacts, and audit trail stay identical.",
        "",
        "## Input",
        "```json",
        inputPretty,
        "```",
      ].join("\n"),
      tags: req.skill ? [req.skill.category] : [],
    };
  }
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
