"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ListChecksIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RunStatusBadge } from "@/components/shared/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useAgents } from "@/lib/queries/use-agents";
import { useRuns } from "@/lib/queries/use-runs";
import type { RunStatus } from "@/lib/types";
import { formatCost, formatDateTime, formatDuration } from "@/lib/utils";

function RunsPageInner() {
  const { workspace } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routine") ?? undefined;

  const [statusFilter, setStatusFilter] = useState<RunStatus | "all">("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  const { data: agents } = useAgents(workspace.id);
  const { data: runs, isLoading } = useRuns(workspace.id, {
    status: statusFilter,
    agentId: agentFilter === "all" ? undefined : agentFilter,
    routineId,
    limit: 100,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Runs"
        description={
          routineId
            ? "Run history for the selected routine."
            : "Every agent execution — status, cost, duration, and full audit trail."
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as RunStatus | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(
              [
                "queued",
                "running",
                "needs_approval",
                "succeeded",
                "failed",
                "cancelled",
              ] as const
            ).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {(agents ?? []).map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.avatar ?? "🤖"} {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {routineId ? (
          <Link href={`${base}/runs`} className="text-primary text-sm underline underline-offset-2">
            Clear routine filter
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : !runs?.length ? (
        <EmptyState
          icon={ListChecksIcon}
          title="No runs found"
          description="Runs appear here when you or a routine execute a skill."
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Link href={`${base}/runs/${run.id}`} className="block max-w-64">
                      <p className="truncate text-sm font-medium hover:underline">
                        {run.skill?.name ?? "Ad-hoc run"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {run.agent?.avatar ?? "🤖"} {run.agent?.name ?? "Unknown agent"}
                        {run.routine_id ? " · routine" : ""}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <RunStatusBadge status={run.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(run.created_at)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {run.started_at
                      ? formatDuration(
                          run.started_at,
                          run.finished_at ?? (run.status === "running" ? null : run.started_at)
                        )
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {run.model ?? "—"}
                    {run.effort ? ` · ${run.effort}` : ""}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatCost(run.cost_estimate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function RunsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-80 w-full rounded-xl" />}>
      <RunsPageInner />
    </Suspense>
  );
}
