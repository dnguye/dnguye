"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClockIcon,
  HistoryIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { RoutineFormDialog } from "@/components/routines/routine-form-dialog";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { describeCron } from "@/lib/cron";
import { useAgents } from "@/lib/queries/use-agents";
import {
  useDeleteRoutine,
  useRoutines,
  useToggleRoutine,
} from "@/lib/queries/use-routines";
import { useExecuteRun, useRuns } from "@/lib/queries/use-runs";
import { useSkills } from "@/lib/queries/use-skills";
import type { Routine, Run } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

export default function RoutinesPage() {
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const { data: routines, isLoading } = useRoutines(workspace.id);
  const { data: agents } = useAgents(workspace.id);
  const { data: skills } = useSkills(workspace.id);
  const { data: recentRuns } = useRuns(workspace.id, { limit: 200 });
  const toggleRoutine = useToggleRoutine(workspace.id);
  const deleteRoutine = useDeleteRoutine(workspace.id);
  const executeRun = useExecuteRun(workspace.id);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState<Routine | null>(null);

  const lastRunByRoutine = useMemo(() => {
    const map = new Map<string, Run>();
    for (const run of recentRuns ?? []) {
      if (run.routine_id && !map.has(run.routine_id)) map.set(run.routine_id, run);
    }
    return map;
  }, [recentRuns]);

  const sorted = useMemo(
    () =>
      [...(routines ?? [])].sort((a, b) => {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return (a.next_run_at ?? "9999") < (b.next_run_at ?? "9999") ? -1 : 1;
      }),
    [routines]
  );

  function runNow(routine: Routine) {
    if (!routine.agent_id) {
      toast.error("This routine has no agent assigned");
      return;
    }
    executeRun.mutate(
      {
        workspace_id: workspace.id,
        agent_id: routine.agent_id,
        skill_id: routine.skill_id,
        routine_id: routine.id,
        input:
          routine.approval_policy === "require_approval"
            ? { ...routine.input, __require_approval: true }
            : routine.input,
      },
      {
        onSuccess: ({ run_id }) =>
          toast.success("Routine run queued", {
            action: {
              label: "View run",
              onClick: () => router.push(`${base}/runs/${run_id}`),
            },
          }),
        onError: (error) => toast.error("Run failed", { description: error.message }),
      }
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Routines"
        description="Scheduled agent work. Executed server-side by the scheduler — see the README for wiring up the cron ticker."
        actions={
          canEdit ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <PlusIcon /> New routine
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : !sorted.length ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="No routines yet"
          description="Automate recurring work: briefings, digests, cleanups — on a cron schedule."
          action={
            canEdit ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <PlusIcon /> New routine
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Routine</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Agent / Skill</TableHead>
                <TableHead>Next run</TableHead>
                <TableHead>Last run</TableHead>
                <TableHead className="w-24 text-right">Enabled</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((routine) => {
                const agent = agents?.find((a) => a.id === routine.agent_id);
                const skill = skills?.find((s) => s.id === routine.skill_id);
                const lastRun = lastRunByRoutine.get(routine.id);
                return (
                  <TableRow key={routine.id}>
                    <TableCell>
                      <div className="max-w-56">
                        <p className="truncate text-sm font-medium">{routine.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {routine.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{describeCron(routine.schedule_cron)}</div>
                      <div className="text-muted-foreground text-xs">
                        {routine.timezone}
                        {routine.approval_policy === "require_approval" ? (
                          <Badge variant="warning" className="ml-1.5 text-[10px]">
                            approval
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {agent ? `${agent.avatar ?? "🤖"} ${agent.name}` : "—"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {skill?.name ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {routine.enabled ? formatRelative(routine.next_run_at) : "—"}
                    </TableCell>
                    <TableCell>
                      {lastRun ? (
                        <Link
                          href={`${base}/runs/${lastRun.id}`}
                          className="flex flex-col gap-0.5"
                        >
                          <RunStatusBadge status={lastRun.status} />
                          <span className="text-muted-foreground text-xs">
                            {formatRelative(lastRun.created_at)}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {formatRelative(routine.last_run_at)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={routine.enabled}
                        disabled={!canEdit}
                        aria-label={`Toggle ${routine.name}`}
                        onCheckedChange={() =>
                          toggleRoutine.mutate(routine, {
                            onSuccess: () =>
                              toast.success(
                                routine.enabled ? "Routine paused" : "Routine enabled"
                              ),
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${routine.name}`}
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled={!canEdit}
                            onSelect={() => runNow(routine)}
                          >
                            <PlayIcon /> Run now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              router.push(`${base}/runs?routine=${routine.id}`)
                            }
                          >
                            <HistoryIcon /> Run history
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!canEdit}
                            onSelect={() => {
                              setEditing(routine);
                              setFormOpen(true);
                            }}
                          >
                            <PencilIcon /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={!canEdit}
                            onSelect={() => setDeleting(routine)}
                          >
                            <Trash2Icon /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <RoutineFormDialog open={formOpen} onOpenChange={setFormOpen} routine={editing} />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The schedule stops immediately. Past runs keep their history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (!deleting) return;
                deleteRoutine.mutate(deleting, {
                  onSuccess: () => toast.success("Routine deleted"),
                  onError: (error) =>
                    toast.error("Delete failed", { description: error.message }),
                });
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
