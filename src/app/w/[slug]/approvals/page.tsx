"use client";

import Link from "next/link";
import { CheckIcon, ShieldCheckIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

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
import { PageHeader } from "@/components/shared/page-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useApproveRun, useRuns } from "@/lib/queries/use-runs";
import { formatRelative } from "@/lib/utils";

export default function ApprovalsPage() {
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const { data: runs, isLoading } = useRuns(workspace.id, {
    status: "needs_approval",
    limit: 50,
  });
  const approveRun = useApproveRun(workspace.id);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approvals"
        description="Write actions proposed by agents. Nothing external happens until a human explicitly approves the exact payload shown here."
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : !runs?.length ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No pending approvals"
          description="When an agent wants to write outside the workspace, the proposed action lands here first."
        />
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <Card key={run.id} className="border-warning/40">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  {run.proposed_action?.title ?? "Proposed action"}
                  <span className="text-muted-foreground text-xs font-normal">
                    {run.agent?.avatar ?? "🤖"} {run.agent?.name ?? "Agent"} ·{" "}
                    {formatRelative(run.created_at)}
                  </span>
                </CardTitle>
                <CardDescription>
                  {run.proposed_action?.summary}
                  <span className="mt-1 block">
                    Destination:{" "}
                    <code className="bg-muted rounded px-1">
                      {run.proposed_action?.destination ?? "unknown"}
                    </code>
                    {" · "}
                    Kind:{" "}
                    <code className="bg-muted rounded px-1">
                      {run.proposed_action?.kind ?? "write"}
                    </code>
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Exact payload
                  </p>
                  <pre className="bg-muted/50 max-h-56 overflow-auto rounded-lg border p-3 text-xs">
                    {JSON.stringify(run.proposed_action?.payload ?? {}, null, 2)}
                  </pre>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canEdit ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          approveRun.mutate(
                            { runId: run.id, decision: "approve" },
                            {
                              onSuccess: () =>
                                toast.success("Approved — executing now", {
                                  description:
                                    "You are recorded as the approving user in the audit log.",
                                }),
                              onError: (error) =>
                                toast.error("Approval failed", {
                                  description: error.message,
                                }),
                            }
                          )
                        }
                        disabled={approveRun.isPending}
                      >
                        <CheckIcon /> Approve and execute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          approveRun.mutate(
                            { runId: run.id, decision: "reject" },
                            {
                              onSuccess: () => toast.success("Rejected — run cancelled"),
                              onError: (error) =>
                                toast.error("Rejection failed", {
                                  description: error.message,
                                }),
                            }
                          )
                        }
                        disabled={approveRun.isPending}
                      >
                        <XIcon /> Reject
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Viewers cannot approve actions.
                    </p>
                  )}
                  <Link
                    href={`${base}/runs/${run.id}`}
                    className="text-primary ml-auto text-sm underline underline-offset-2"
                  >
                    View full run
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
