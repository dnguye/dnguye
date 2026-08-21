"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BotIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { AgentStatusBadge } from "@/components/shared/status-badge";
import { AgentFormDialog } from "@/components/agents/agent-form-dialog";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useAgents } from "@/lib/queries/use-agents";

export default function AgentsPage() {
  const { workspace, canEdit } = useWorkspace();
  const { data: agents, isLoading } = useAgents(workspace.id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return (agents ?? []).filter((agent) => {
      if (statusFilter !== "all" && agent.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        agent.name.toLowerCase().includes(term) ||
        agent.description.toLowerCase().includes(term) ||
        agent.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [agents, search, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Agents"
        description="Your team of AI workers — each with its own model, prompt, tools, and permission profile."
        actions={
          canEdit ? (
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon /> New agent
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents…"
            className="pl-8"
            aria-label="Search agents"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={BotIcon}
          title={agents?.length ? "No agents match your filters" : "No agents yet"}
          description={
            agents?.length
              ? "Try a different search or status filter."
              : "Create your first agent to start delegating work."
          }
          action={
            canEdit && !agents?.length ? (
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon /> New agent
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <Link key={agent.id} href={`/w/${workspace.slug}/agents/${agent.id}`}>
              <Card className="hover:border-primary/50 h-full gap-3 transition-colors">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl leading-none">{agent.avatar ?? "🤖"}</span>
                    <AgentStatusBadge status={agent.status} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {agent.description || "No description"}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge variant="muted">{agent.model}</Badge>
                    <Badge variant="muted">{agent.default_effort}</Badge>
                    {agent.permissions?.can_write_external ? (
                      <Badge variant="warning">writes</Badge>
                    ) : null}
                    {agent.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AgentFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
