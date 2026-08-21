"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BrainIcon,
  PencilIcon,
  PlayIcon,
  SparklesIcon,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { AgentStatusBadge, RunStatusBadge } from "@/components/shared/status-badge";
import { Markdown } from "@/components/shared/markdown";
import { AgentFormDialog } from "@/components/agents/agent-form-dialog";
import { useCommandCenter } from "@/components/workspace/command-center-context";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useAgent, useDeleteAgent } from "@/lib/queries/use-agents";
import { useKnowledgeGraph } from "@/lib/queries/use-knowledge";
import { useRuns } from "@/lib/queries/use-runs";
import { useSkills } from "@/lib/queries/use-skills";
import { formatCost, formatDuration, formatRelative } from "@/lib/utils";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const { openQuickRun } = useCommandCenter();
  const base = `/w/${workspace.slug}`;

  const { data: agent, isLoading } = useAgent(workspace.id, id);
  const { data: skills } = useSkills(workspace.id);
  const { data: runs } = useRuns(workspace.id, { agentId: id, limit: 50 });
  const { data: graph } = useKnowledgeGraph(workspace.id);
  const deleteAgent = useDeleteAgent(workspace.id);
  const [editOpen, setEditOpen] = useState(false);

  const agentSkills = useMemo(
    () => (skills ?? []).filter((s) => s.default_agent_id === id),
    [skills, id]
  );

  const memoryNodes = useMemo(() => {
    if (!graph) return [];
    const self = graph.nodes.find((n) => n.entity_id === id);
    if (!self) return [];
    const neighborIds = new Set(
      graph.edges
        .filter((e) => e.source_node_id === self.id || e.target_node_id === self.id)
        .flatMap((e) => [e.source_node_id, e.target_node_id])
    );
    neighborIds.delete(self.id);
    return graph.nodes.filter(
      (n) => neighborIds.has(n.id) || (n.type === "router" && n.content_markdown)
    );
  }, [graph, id]);

  const stats = useMemo(() => {
    const total = runs?.length ?? 0;
    const succeeded = runs?.filter((r) => r.status === "succeeded").length ?? 0;
    const cost = (runs ?? []).reduce((sum, r) => sum + (r.cost_estimate ?? 0), 0);
    return { total, succeeded, cost };
  }, [runs]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (!agent) {
    return (
      <EmptyState
        icon={BrainIcon}
        title="Agent not found"
        action={
          <Button asChild variant="outline">
            <Link href={`${base}/agents`}>Back to agents</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to agents">
          <Link href={`${base}/agents`}>
            <ArrowLeftIcon />
          </Link>
        </Button>
        <span className="text-3xl">{agent.avatar ?? "🤖"}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{agent.name}</h1>
            <AgentStatusBadge status={agent.status} />
          </div>
          <p className="text-muted-foreground truncate text-sm">{agent.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openQuickRun(agentSkills[0]?.id ?? null)}>
            <PlayIcon /> Run
          </Button>
          {canEdit ? (
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <PencilIcon /> Edit
            </Button>
          ) : null}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardDescription>Runs</CardDescription>
                <CardTitle className="text-2xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Success rate</CardDescription>
                <CardTitle className="text-2xl">
                  {stats.total ? Math.round((stats.succeeded / stats.total) * 100) : 0}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Estimated spend</CardDescription>
                <CardTitle className="text-2xl">{formatCost(stats.cost)}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Provider</span>
                  <span>{agent.provider}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Model</span>
                  <span>{agent.model}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Default effort</span>
                  <span>{agent.default_effort}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">External writes</span>
                  <span>
                    {agent.permissions?.can_write_external
                      ? "Allowed (with approval)"
                      : "Not allowed"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-muted-foreground">Permitted tools</span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.enabled_tools.length ? (
                      agent.enabled_tools.map((tool) => (
                        <Badge key={tool} variant="muted">
                          {tool}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 max-h-64 overflow-auto rounded-lg border p-3 text-xs whitespace-pre-wrap">
                  {agent.system_prompt || "No system prompt configured."}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          {!agentSkills.length ? (
            <EmptyState
              icon={SparklesIcon}
              title="No skills assigned"
              description="Set this agent as a skill's default agent to see it here."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {agentSkills.map((skill) => (
                <Card key={skill.id} className="gap-2">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      <Link
                        href={`${base}/skills/${skill.id}`}
                        className="hover:underline"
                      >
                        {skill.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {skill.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-2">
                    <Badge variant="muted">v{skill.version}</Badge>
                    <Badge variant={skill.is_active ? "success" : "muted"}>
                      {skill.is_active ? "active" : "inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-auto"
                      onClick={() => openQuickRun(skill.id)}
                    >
                      <PlayIcon /> Run
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="runs">
          {!runs?.length ? (
            <EmptyState icon={PlayIcon} title="No runs yet" />
          ) : (
            <ul className="divide-y rounded-xl border">
              {runs.map((run) => (
                <li key={run.id}>
                  <Link
                    href={`${base}/runs/${run.id}`}
                    className="hover:bg-accent/50 flex items-center gap-3 px-4 py-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{run.skill?.name ?? "Ad-hoc run"}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatRelative(run.created_at)} ·{" "}
                        {formatDuration(run.started_at, run.finished_at)} ·{" "}
                        {formatCost(run.cost_estimate)}
                      </p>
                    </div>
                    <RunStatusBadge status={run.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <p className="text-muted-foreground text-sm">
            What this agent “knows”: knowledge-graph nodes linked to it, including router
            documents that point it at the right projects, skills, and constraints.
          </p>
          {!memoryNodes.length ? (
            <EmptyState
              icon={BrainIcon}
              title="No linked knowledge"
              description="Connect this agent to nodes in the knowledge graph to give it durable context."
              action={
                <Button asChild variant="outline">
                  <Link href={`${base}/knowledge`}>Open knowledge graph</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {memoryNodes.map((node) => (
                <Card key={node.id} className="gap-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {node.title}
                      <Badge variant="muted">{node.type}</Badge>
                    </CardTitle>
                    {node.summary ? (
                      <CardDescription>{node.summary}</CardDescription>
                    ) : null}
                  </CardHeader>
                  {node.content_markdown ? (
                    <CardContent>
                      <div className="bg-muted/40 max-h-56 overflow-y-auto rounded-lg border p-3">
                        <Markdown>{node.content_markdown}</Markdown>
                      </div>
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edit configuration</CardTitle>
              <CardDescription>
                Model, prompt, tools, and the permission profile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                onClick={() => setEditOpen(true)}
                disabled={!canEdit}
              >
                <PencilIcon /> Edit agent
              </Button>
            </CardContent>
          </Card>
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Deleting an agent keeps its historical runs but removes it from skills and
                routines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!canEdit}>
                    <Trash2Icon /> Delete agent
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {agent.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone. Routines using this agent will stop running.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() =>
                        deleteAgent.mutate(agent, {
                          onSuccess: () => {
                            toast.success("Agent deleted");
                            router.push(`${base}/agents`);
                          },
                          onError: (error) =>
                            toast.error("Delete failed", { description: error.message }),
                        })
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AgentFormDialog open={editOpen} onOpenChange={setEditOpen} agent={agent} />
    </div>
  );
}
