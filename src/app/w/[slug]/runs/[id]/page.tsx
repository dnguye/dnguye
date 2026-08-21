"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BanIcon,
  CheckIcon,
  FileBoxIcon,
  ListChecksIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { RunStatusBadge } from "@/components/shared/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useArtifacts } from "@/lib/queries/use-artifacts";
import {
  useApproveRun,
  useCancelRun,
  useExecuteRun,
  useRun,
} from "@/lib/queries/use-runs";
import { formatCost, formatDateTime, formatDuration } from "@/lib/utils";

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="bg-muted/50 max-h-72 overflow-auto rounded-lg border p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;

  const { data: run, isLoading } = useRun(workspace.id, id);
  const { data: artifacts } = useArtifacts(workspace.id, { limit: 200 });
  const approveRun = useApproveRun(workspace.id);
  const cancelRun = useCancelRun(workspace.id);
  const executeRun = useExecuteRun(workspace.id);

  const runArtifacts = (artifacts ?? []).filter((a) => a.run_id === id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (!run) {
    return (
      <EmptyState
        icon={ListChecksIcon}
        title="Run not found"
        action={
          <Button asChild variant="outline">
            <Link href={`${base}/runs`}>Back to runs</Link>
          </Button>
        }
      />
    );
  }

  const cancellable = ["queued", "running", "needs_approval"].includes(run.status);
  const retryable = ["failed", "cancelled"].includes(run.status);

  function handleRetry() {
    if (!run?.agent_id) {
      toast.error("Original agent no longer exists");
      return;
    }
    executeRun.mutate(
      {
        workspace_id: workspace.id,
        agent_id: run.agent_id,
        skill_id: run.skill_id,
        routine_id: run.routine_id,
        input: run.input,
        model: run.model ?? undefined,
        effort: (run.effort as "low" | "medium" | "high" | "max" | null) ?? undefined,
      },
      {
        onSuccess: ({ run_id }) => {
          toast.success("Retry queued");
          router.push(`${base}/runs/${run_id}`);
        },
        onError: (error) => toast.error("Retry failed", { description: error.message }),
      }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to runs">
          <Link href={`${base}/runs`}>
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">
              {run.skill?.name ?? "Ad-hoc run"}
            </h1>
            <RunStatusBadge status={run.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {run.agent?.avatar ?? "🤖"} {run.agent?.name ?? "Unknown agent"} ·{" "}
            {formatDateTime(run.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {retryable && canEdit ? (
            <Button variant="secondary" onClick={handleRetry} disabled={executeRun.isPending}>
              <RotateCcwIcon /> Retry
            </Button>
          ) : null}
          {cancellable && canEdit ? (
            <Button
              variant="outline"
              onClick={() =>
                cancelRun.mutate(id, {
                  onSuccess: () => toast.success("Run cancelled"),
                  onError: (error) =>
                    toast.error("Cancel failed", { description: error.message }),
                })
              }
              disabled={cancelRun.isPending}
            >
              <BanIcon /> Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {run.status === "needs_approval" && run.proposed_action ? (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlertIcon className="text-warning size-4" />
              Approval required: {run.proposed_action.title}
            </CardTitle>
            <CardDescription>
              This is a <strong>write</strong> action targeting{" "}
              <code className="bg-muted rounded px-1">{run.proposed_action.destination}</code>.
              Nothing executes until you approve it. {run.proposed_action.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <JsonBlock value={run.proposed_action.payload} />
            {canEdit ? (
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    approveRun.mutate(
                      { runId: id, decision: "approve" },
                      {
                        onSuccess: () => toast.success("Approved — executing now"),
                        onError: (error) =>
                          toast.error("Approval failed", { description: error.message }),
                      }
                    )
                  }
                  disabled={approveRun.isPending}
                >
                  <CheckIcon /> Approve and execute
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    approveRun.mutate(
                      { runId: id, decision: "reject" },
                      {
                        onSuccess: () => toast.success("Rejected — run cancelled"),
                        onError: (error) =>
                          toast.error("Rejection failed", { description: error.message }),
                      }
                    )
                  }
                  disabled={approveRun.isPending}
                >
                  <XIcon /> Reject
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                A workspace member with edit access must approve this action.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Model</span>
              <span>{run.model ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Effort</span>
              <span>{run.effort ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Started</span>
              <span>{formatDateTime(run.started_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Finished</span>
              <span>{formatDateTime(run.finished_at)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Duration</span>
              <span>
                {run.started_at
                  ? formatDuration(run.started_at, run.finished_at)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cost estimate</span>
              <span>{formatCost(run.cost_estimate)}</span>
            </div>
            {run.approved_at ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Approved</span>
                <span>{formatDateTime(run.approved_at)}</span>
              </div>
            ) : null}
            {run.skill ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Skill</span>
                <Link
                  href={`${base}/skills/${run.skill.id}`}
                  className="text-primary underline underline-offset-2"
                >
                  {run.skill.name}
                </Link>
              </div>
            ) : null}
            {run.error_message ? (
              <div className="space-y-1 pt-1">
                <span className="text-destructive text-xs font-medium">Error</span>
                <p className="bg-destructive/10 text-destructive rounded-md p-2 text-xs">
                  {run.error_message}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {!run.progress?.length ? (
              <p className="text-muted-foreground text-sm">No progress recorded yet.</p>
            ) : (
              <ol className="relative space-y-3 border-l pl-4">
                {run.progress.map((step, index) => (
                  <li key={index} className="relative">
                    <span
                      className={`absolute top-1.5 -left-[21.5px] size-2.5 rounded-full border-2 ${
                        index === run.progress.length - 1 && run.status === "running"
                          ? "border-primary bg-primary animate-pulse"
                          : "border-border bg-muted"
                      }`}
                    />
                    <p className="text-sm">{step.step}</p>
                    <p className="text-muted-foreground text-xs">
                      {step.detail ?? ""}
                      {step.at ? ` ${formatDateTime(step.at)}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock value={run.input ?? {}} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            {run.output ? (
              <JsonBlock value={run.output} />
            ) : (
              <p className="text-muted-foreground text-sm">No output yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Artifacts</CardTitle>
          <CardDescription>Outputs generated by this run.</CardDescription>
        </CardHeader>
        <CardContent>
          {!runArtifacts.length ? (
            <p className="text-muted-foreground text-sm">No artifacts produced.</p>
          ) : (
            <ul className="divide-y">
              {runArtifacts.map((artifact) => (
                <li key={artifact.id}>
                  <Link
                    href={`${base}/artifacts/${artifact.id}`}
                    className="hover:bg-accent/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors"
                  >
                    <FileBoxIcon className="text-muted-foreground size-4" />
                    <span className="flex-1 truncate text-sm">{artifact.title}</span>
                    <Badge variant="muted">{artifact.type}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
