"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BotIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  FileBoxIcon,
  InboxIcon,
  PlayIcon,
  PlugIcon,
  SearchIcon,
  ShieldAlertIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AgentStatusBadge,
  ConnectionStatusBadge,
} from "@/components/shared/status-badge";
import { useCommandCenter } from "@/components/workspace/command-center-context";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { describeCron } from "@/lib/cron";
import { useAgents } from "@/lib/queries/use-agents";
import { useArtifacts } from "@/lib/queries/use-artifacts";
import { useAuditEvents } from "@/lib/queries/use-audit";
import { useConnections } from "@/lib/queries/use-connections";
import { useRoutines } from "@/lib/queries/use-routines";
import { useRuns } from "@/lib/queries/use-runs";
import { useSkills } from "@/lib/queries/use-skills";
import { formatRelative } from "@/lib/utils";

function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function WidgetEmpty({ text }: { text: string }) {
  return (
    <div className="text-muted-foreground flex h-full min-h-24 items-center justify-center p-4 text-center text-sm">
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function AttentionWidget() {
  const { workspace } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const { data: approvals, isLoading: l1 } = useRuns(workspace.id, {
    status: "needs_approval",
    limit: 10,
  });
  const { data: failed, isLoading: l2 } = useRuns(workspace.id, {
    status: "failed",
    limit: 5,
  });
  const { data: connections } = useConnections(workspace.id);
  const attentionConnections = (connections ?? []).filter(
    (c) => c.status === "attention"
  );

  if (l1 || l2) return <WidgetSkeleton />;
  const empty =
    !approvals?.length && !failed?.length && !attentionConnections.length;
  if (empty) {
    return <WidgetEmpty text="Nothing needs your attention. Enjoy the calm." />;
  }
  return (
    <ul className="divide-y">
      {(approvals ?? []).map((run) => (
        <li key={run.id}>
          <Link
            href={`${base}/approvals`}
            className="hover:bg-accent/50 flex items-center gap-3 px-3 py-2.5 transition-colors"
          >
            <ShieldAlertIcon className="text-warning size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {run.proposed_action?.title ?? "Run awaiting approval"}
              </p>
              <p className="text-muted-foreground text-xs">
                {run.agent?.name ?? "Agent"} · {formatRelative(run.created_at)}
              </p>
            </div>
            <Badge variant="warning">Approve</Badge>
          </Link>
        </li>
      ))}
      {(failed ?? []).map((run) => (
        <li key={run.id}>
          <Link
            href={`${base}/runs/${run.id}`}
            className="hover:bg-accent/50 flex items-center gap-3 px-3 py-2.5 transition-colors"
          >
            <XCircleIcon className="text-destructive size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                {run.skill?.name ?? "Ad-hoc run"} failed
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {run.error_message ?? "Unknown error"} · {formatRelative(run.created_at)}
              </p>
            </div>
          </Link>
        </li>
      ))}
      {attentionConnections.map((connection) => (
        <li key={connection.id}>
          <Link
            href={`${base}/connections`}
            className="hover:bg-accent/50 flex items-center gap-3 px-3 py-2.5 transition-colors"
          >
            <AlertTriangleIcon className="text-warning size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{connection.display_name} needs attention</p>
              <p className="text-muted-foreground text-xs">
                {(connection.metadata?.note as string) ?? "Reauthorization required"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function UpcomingRoutinesWidget() {
  const { workspace } = useWorkspace();
  const { data: routines, isLoading } = useRoutines(workspace.id);
  if (isLoading) return <WidgetSkeleton />;
  const upcoming = (routines ?? [])
    .filter((r) => r.enabled && r.next_run_at)
    .sort((a, b) => (a.next_run_at! < b.next_run_at! ? -1 : 1))
    .slice(0, 5);
  if (!upcoming.length)
    return <WidgetEmpty text="No scheduled routines. Create one to automate work." />;
  return (
    <ul className="divide-y">
      {upcoming.map((routine) => (
        <li key={routine.id} className="flex items-center gap-3 px-3 py-2.5">
          <CalendarClockIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{routine.name}</p>
            <p className="text-muted-foreground text-xs">
              {describeCron(routine.schedule_cron)} · {routine.timezone}
            </p>
          </div>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatRelative(routine.next_run_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RecentArtifactsWidget() {
  const { workspace } = useWorkspace();
  const [search, setSearch] = useState("");
  const { data: artifacts, isLoading } = useArtifacts(workspace.id, {
    search,
    limit: 8,
  });
  const base = `/w/${workspace.slug}`;
  return (
    <div className="flex h-full flex-col">
      <div className="relative shrink-0 p-2 pb-0">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-4 size-3.5 translate-y-[calc(-50%+4px)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artifacts…"
          className="h-8 pl-8 text-xs"
          aria-label="Search artifacts"
        />
      </div>
      {isLoading ? (
        <WidgetSkeleton rows={2} />
      ) : !artifacts?.length ? (
        <WidgetEmpty
          text={search ? "No artifacts match your search." : "No artifacts yet — run a skill to generate one."}
        />
      ) : (
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
          {artifacts.map((artifact) => (
            <li key={artifact.id}>
              <Link
                href={`${base}/artifacts/${artifact.id}`}
                className="hover:bg-accent/50 flex items-center gap-3 px-3 py-2.5 transition-colors"
              >
                <FileBoxIcon className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{artifact.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {artifact.type} · {formatRelative(artifact.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SkillsDeckWidget() {
  const { workspace } = useWorkspace();
  const { openQuickRun } = useCommandCenter();
  const { data: skills, isLoading } = useSkills(workspace.id);
  const { data: agents } = useAgents(workspace.id);
  const [efforts, setEfforts] = useState<Record<string, string>>({});
  if (isLoading) return <WidgetSkeleton />;
  const active = (skills ?? []).filter((s) => s.is_active).slice(0, 6);
  if (!active.length)
    return <WidgetEmpty text="No active skills. Create a skill to teach your agents." />;
  return (
    <ul className="grid gap-2 p-2 sm:grid-cols-2">
      {active.map((skill) => {
        const agent =
          agents?.find((a) => a.id === skill.default_agent_id) ?? agents?.[0];
        const effort = efforts[skill.id] ?? agent?.default_effort ?? "medium";
        return (
          <li
            key={skill.id}
            className="bg-background/60 flex flex-col gap-2 rounded-lg border p-2.5"
          >
            <div className="flex items-start gap-2">
              <SparklesIcon className="text-primary mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{skill.name}</p>
                <p className="text-muted-foreground line-clamp-2 text-xs">
                  {skill.description}
                </p>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-1.5">
              <Badge variant="muted" className="text-[10px]">
                {agent?.model ?? "simulated-large"}
              </Badge>
              <Select
                value={effort}
                onValueChange={(v) =>
                  setEfforts((prev) => ({ ...prev, [skill.id]: v }))
                }
              >
                <SelectTrigger
                  size="sm"
                  className="h-7 gap-1 px-2 text-[11px]"
                  aria-label={`Effort for ${skill.name}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "max"].map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                className="ml-auto h-7"
                onClick={() => openQuickRun(skill.id)}
              >
                <PlayIcon className="size-3.5" /> Run
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function AgentStatusWidget() {
  const { workspace } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const { data: agents, isLoading } = useAgents(workspace.id);
  const { data: runningRuns } = useRuns(workspace.id, { status: "running", limit: 20 });
  if (isLoading) return <WidgetSkeleton />;
  if (!agents?.length)
    return <WidgetEmpty text="No agents yet. Create your first agent to get started." />;
  return (
    <ul className="divide-y">
      {agents.map((agent) => {
        const current = runningRuns?.find((run) => run.agent_id === agent.id);
        return (
          <li key={agent.id}>
            <Link
              href={`${base}/agents/${agent.id}`}
              className="hover:bg-accent/50 flex items-center gap-3 px-3 py-2.5 transition-colors"
            >
              <span className="text-lg leading-none">{agent.avatar ?? "🤖"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{agent.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {current
                    ? `Working: ${current.skill?.name ?? "ad-hoc run"}`
                    : `${agent.model} · ${agent.default_effort} effort`}
                </p>
              </div>
              <AgentStatusBadge status={agent.status} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ConnectedAppsWidget() {
  const { workspace } = useWorkspace();
  const { data: connections, isLoading } = useConnections(workspace.id);
  if (isLoading) return <WidgetSkeleton />;
  if (!connections?.length)
    return <WidgetEmpty text="No connections configured yet." />;
  return (
    <ul className="divide-y">
      {connections.map((connection) => (
        <li key={connection.id} className="flex items-center gap-3 px-3 py-2.5">
          <PlugIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{connection.display_name}</p>
            <p className="text-muted-foreground text-xs">
              {connection.last_sync_at
                ? `Synced ${formatRelative(connection.last_sync_at)}`
                : "Never synced"}
            </p>
          </div>
          <ConnectionStatusBadge status={connection.status} />
        </li>
      ))}
    </ul>
  );
}

export function ActivityFeedWidget() {
  const { workspace } = useWorkspace();
  const { data: events, isLoading } = useAuditEvents(workspace.id, 25);
  if (isLoading) return <WidgetSkeleton rows={5} />;
  if (!events?.length) return <WidgetEmpty text="No activity recorded yet." />;
  return (
    <ul className="divide-y">
      {events.map((event) => (
        <li key={event.id} className="flex items-start gap-3 px-3 py-2">
          <span className="mt-0.5">
            {event.event_type.includes("failed") ? (
              <XCircleIcon className="text-destructive size-3.5" />
            ) : event.event_type.includes("succeeded") ||
              event.event_type.includes("granted") ? (
              <CheckCircle2Icon className="text-success size-3.5" />
            ) : event.event_type.includes("approval") ||
              event.event_type.includes("attention") ? (
              <ShieldAlertIcon className="text-warning size-3.5" />
            ) : (
              <ActivityIcon className="text-muted-foreground size-3.5" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs">
              <span className="font-medium">{event.event_type}</span>
              {typeof event.payload?.name === "string" ? (
                <span className="text-muted-foreground"> · {event.payload.name}</span>
              ) : typeof event.payload?.title === "string" ? (
                <span className="text-muted-foreground"> · {event.payload.title}</span>
              ) : null}
            </p>
            <p className="text-muted-foreground text-[11px]">
              {event.actor_type} · {formatRelative(event.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */

export interface WidgetDef {
  id: string;
  title: string;
  icon: typeof InboxIcon;
  href?: (base: string) => string;
  component: React.ComponentType;
  /** Default grid placement (12-column grid). */
  default: { x: number; y: number; w: number; h: number };
  minW?: number;
  minH?: number;
}

export const WIDGETS: WidgetDef[] = [
  {
    id: "attention",
    title: "Attention needed",
    icon: ShieldAlertIcon,
    href: (base) => `${base}/approvals`,
    component: AttentionWidget,
    default: { x: 0, y: 0, w: 6, h: 5 },
    minW: 3,
    minH: 3,
  },
  {
    id: "routines",
    title: "Upcoming routines",
    icon: CalendarClockIcon,
    href: (base) => `${base}/routines`,
    component: UpcomingRoutinesWidget,
    default: { x: 6, y: 0, w: 6, h: 5 },
    minW: 3,
    minH: 3,
  },
  {
    id: "skills",
    title: "Skills deck",
    icon: SparklesIcon,
    href: (base) => `${base}/skills`,
    component: SkillsDeckWidget,
    default: { x: 0, y: 5, w: 8, h: 6 },
    minW: 4,
    minH: 4,
  },
  {
    id: "agents",
    title: "Agent status",
    icon: BotIcon,
    href: (base) => `${base}/agents`,
    component: AgentStatusWidget,
    default: { x: 8, y: 5, w: 4, h: 6 },
    minW: 3,
    minH: 3,
  },
  {
    id: "artifacts",
    title: "Recent artifacts",
    icon: FileBoxIcon,
    href: (base) => `${base}/artifacts`,
    component: RecentArtifactsWidget,
    default: { x: 0, y: 11, w: 4, h: 6 },
    minW: 3,
    minH: 3,
  },
  {
    id: "connections",
    title: "Connected apps",
    icon: PlugIcon,
    href: (base) => `${base}/connections`,
    component: ConnectedAppsWidget,
    default: { x: 4, y: 11, w: 4, h: 6 },
    minW: 3,
    minH: 3,
  },
  {
    id: "activity",
    title: "Activity feed",
    icon: ActivityIcon,
    href: (base) => `${base}/runs`,
    component: ActivityFeedWidget,
    default: { x: 8, y: 11, w: 4, h: 6 },
    minW: 3,
    minH: 3,
  },
];
