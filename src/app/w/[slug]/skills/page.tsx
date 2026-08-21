"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlayIcon, PlusIcon, SearchIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

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
import { useCommandCenter } from "@/components/workspace/command-center-context";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useSaveSkill, useSkillRunStats, useSkills } from "@/lib/queries/use-skills";
import { formatRelative, slugify } from "@/lib/utils";

export default function SkillsPage() {
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const { openQuickRun } = useCommandCenter();
  const { data: skills, isLoading } = useSkills(workspace.id);
  const { data: stats } = useSkillRunStats(workspace.id);
  const saveSkill = useSaveSkill(workspace.id);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set((skills ?? []).map((s) => s.category))).sort(),
    [skills]
  );

  const filtered = useMemo(() => {
    return (skills ?? []).filter((skill) => {
      if (category !== "all" && skill.category !== category) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        skill.name.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [skills, search, category]);

  function createSkill() {
    const name = "Untitled skill";
    saveSkill.mutate(
      {
        values: {
          name,
          slug: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
          description: "",
          category: "general",
          tags: [],
          instructions_markdown: "# New skill\n\nDescribe the steps here.",
          input_schema: { type: "object", properties: {} },
          output_schema: { type: "object", properties: {} },
          default_agent_id: null,
          is_active: false,
          version_notes: "Initial draft.",
        },
      },
      {
        onSuccess: (skill) => router.push(`/w/${workspace.slug}/skills/${skill.id}`),
        onError: (error) =>
          toast.error("Could not create skill", { description: error.message }),
      }
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Skills"
        description="Reusable playbooks your agents can run — instructions, schemas, and references."
        actions={
          canEdit ? (
            <Button onClick={createSkill} disabled={saveSkill.isPending}>
              <PlusIcon /> New skill
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
            placeholder="Search skills…"
            className="pl-8"
            aria-label="Search skills"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
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
          icon={SparklesIcon}
          title={skills?.length ? "No skills match your filters" : "No skills yet"}
          description={
            skills?.length
              ? "Try a different search or category."
              : "Skills are reusable instructions your agents follow. Create one, or seed the demo workspace for examples."
          }
          action={
            canEdit && !skills?.length ? (
              <Button onClick={createSkill}>
                <PlusIcon /> New skill
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((skill) => {
            const stat = stats?.[skill.id];
            return (
              <Card key={skill.id} className="hover:border-primary/50 h-full gap-3 transition-colors">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/w/${workspace.slug}/skills/${skill.id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-medium hover:underline">{skill.name}</p>
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {skill.description || "No description"}
                      </p>
                    </Link>
                    <Badge variant={skill.is_active ? "success" : "muted"}>
                      {skill.is_active ? "active" : "draft"}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {stat
                      ? `${stat.total} runs · ${stat.succeeded} ok · ${stat.failed} failed · last ${formatRelative(stat.last_run_at)}`
                      : "No runs yet"}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5">
                    <Badge variant="muted">v{skill.version}</Badge>
                    <Badge variant="muted">{skill.category}</Badge>
                    {skill.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ml-auto"
                      disabled={!skill.is_active}
                      onClick={() => openQuickRun(skill.id)}
                    >
                      <PlayIcon /> Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
