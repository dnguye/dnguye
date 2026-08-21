"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FileBoxIcon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  UploadIcon,
} from "lucide-react";
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
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { useArtifacts, useUploadArtifact } from "@/lib/queries/use-artifacts";
import type { ArtifactType } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

const TYPE_OPTIONS: Array<ArtifactType | "all"> = [
  "all",
  "report",
  "markdown",
  "html",
  "json",
  "image",
  "csv",
  "pdf",
  "other",
];

export default function ArtifactsPage() {
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ArtifactType | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: artifacts, isLoading, isError, refetch } = useArtifacts(workspace.id, {
    search,
    type,
    limit: 60,
  });
  const uploadArtifact = useUploadArtifact(workspace.id);

  function handleUpload(file: File) {
    toast.promise(uploadArtifact.mutateAsync({ file }), {
      loading: `Uploading ${file.name}…`,
      success: "Artifact uploaded",
      error: (error: Error) => `Upload failed: ${error.message}`,
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Artifacts"
        description="Everything your agents produce — reports, documents, data files — searchable and traceable to their source run."
        actions={
          canEdit ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = "";
                }}
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                <UploadIcon /> Upload
              </Button>
            </>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title and content…"
            className="pl-8"
            aria-label="Search artifacts"
          />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as ArtifactType | "all")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" ? "All types" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <LayoutGridIcon />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <ListIcon />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={FileBoxIcon}
          title="Couldn't load artifacts"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : !artifacts?.length ? (
        <EmptyState
          icon={FileBoxIcon}
          title={search || type !== "all" ? "No matching artifacts" : "No artifacts yet"}
          description={
            search || type !== "all"
              ? "Try a different search or type filter."
              : "Run a skill to generate your first artifact, or upload a file."
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {artifacts.map((artifact) => (
            <Link key={artifact.id} href={`${base}/artifacts/${artifact.id}`}>
              <Card className="hover:border-primary/50 h-full gap-2 transition-colors">
                <CardContent className="flex h-full flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <FileBoxIcon className="text-primary mt-0.5 size-4 shrink-0" />
                    <p className="min-w-0 flex-1 truncate font-medium">{artifact.title}</p>
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {artifact.searchable_text || "No preview available"}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge variant="muted">{artifact.type}</Badge>
                    {artifact.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-muted-foreground ml-auto text-xs">
                      {formatRelative(artifact.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {artifacts.map((artifact) => (
            <li key={artifact.id}>
              <Link
                href={`${base}/artifacts/${artifact.id}`}
                className="hover:bg-accent/50 flex items-center gap-3 px-4 py-3 transition-colors"
              >
                <FileBoxIcon className="text-muted-foreground size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{artifact.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {artifact.mime_type}
                  </p>
                </div>
                <Badge variant="muted">{artifact.type}</Badge>
                <span className="text-muted-foreground w-20 text-right text-xs">
                  {formatRelative(artifact.created_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
