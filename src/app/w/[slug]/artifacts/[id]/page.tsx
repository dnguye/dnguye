"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileBoxIcon,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Markdown } from "@/components/shared/markdown";
import { RunStatusBadge } from "@/components/shared/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  getArtifactSignedUrl,
  useArtifact,
  useDeleteArtifact,
} from "@/lib/queries/use-artifacts";
import { useRun } from "@/lib/queries/use-runs";
import type { Artifact } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

function ArtifactPreview({ artifact, signedUrl }: { artifact: Artifact; signedUrl: string | null }) {
  if (artifact.content_inline) {
    if (artifact.type === "markdown" || artifact.type === "report") {
      return (
        <div className="rounded-xl border p-4">
          <Markdown>{artifact.content_inline}</Markdown>
        </div>
      );
    }
    if (artifact.type === "html") {
      return (
        <iframe
          title={artifact.title}
          sandbox=""
          srcDoc={artifact.content_inline}
          className="bg-card h-[32rem] w-full rounded-xl border"
        />
      );
    }
    if (artifact.type === "json") {
      let pretty = artifact.content_inline;
      try {
        pretty = JSON.stringify(JSON.parse(artifact.content_inline), null, 2);
      } catch {
        // show raw
      }
      return (
        <pre className="bg-muted/50 max-h-[32rem] overflow-auto rounded-xl border p-4 text-xs">
          {pretty}
        </pre>
      );
    }
    if (artifact.type === "csv") {
      const rows = artifact.content_inline
        .trim()
        .split("\n")
        .map((line) => line.split(","));
      return (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                {rows[0]?.map((cell, i) => (
                  <th key={i} className="px-3 py-2 text-left text-xs font-medium">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, i) => (
                <tr key={i} className="border-b last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-1.5 text-xs">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return (
      <pre className="bg-muted/50 max-h-[32rem] overflow-auto rounded-xl border p-4 text-xs whitespace-pre-wrap">
        {artifact.content_inline}
      </pre>
    );
  }

  if (signedUrl) {
    if (artifact.type === "image") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={signedUrl}
          alt={artifact.title}
          className="max-h-[32rem] w-auto max-w-full rounded-xl border"
        />
      );
    }
    if (artifact.type === "pdf" || artifact.type === "html") {
      return (
        <iframe
          title={artifact.title}
          src={signedUrl}
          className="bg-card h-[32rem] w-full rounded-xl border"
        />
      );
    }
    return (
      <EmptyState
        icon={FileBoxIcon}
        title="No inline preview for this file type"
        description="Use the download button to open the file."
      />
    );
  }

  return (
    <EmptyState
      icon={FileBoxIcon}
      title="No preview available"
      description="This artifact has no inline content or stored file."
    />
  );
}

export default function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;

  const { data: artifact, isLoading } = useArtifact(workspace.id, id);
  const { data: run } = useRun(workspace.id, artifact?.run_id ?? "");
  const deleteArtifact = useDeleteArtifact(workspace.id);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (artifact?.storage_path) {
      getArtifactSignedUrl(workspace.id, artifact.storage_path).then(setSignedUrl);
    }
  }, [artifact?.storage_path, workspace.id]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (!artifact) {
    return (
      <EmptyState
        icon={FileBoxIcon}
        title="Artifact not found"
        action={
          <Button asChild variant="outline">
            <Link href={`${base}/artifacts`}>Back to artifacts</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to artifacts">
          <Link href={`${base}/artifacts`}>
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{artifact.title}</h1>
          <p className="text-muted-foreground text-sm">
            {artifact.mime_type} · {formatDateTime(artifact.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {signedUrl ? (
            <Button asChild variant="outline">
              <a href={signedUrl} target="_blank" rel="noreferrer">
                <DownloadIcon /> Download
              </a>
            </Button>
          ) : null}
          {canEdit ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive">
                  <Trash2Icon /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this artifact?</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{artifact.title}” and its stored file will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() =>
                      deleteArtifact.mutate(artifact, {
                        onSuccess: () => {
                          toast.success("Artifact deleted");
                          router.push(`${base}/artifacts`);
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
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ArtifactPreview artifact={artifact} signedUrl={signedUrl} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="muted">{artifact.type}</Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDateTime(artifact.created_at)}</span>
              </div>
              {run ? (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Source run</span>
                    <Link
                      href={`${base}/runs/${run.id}`}
                      className="text-primary underline underline-offset-2"
                    >
                      View run
                    </Link>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Run status</span>
                    <RunStatusBadge status={run.status} />
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Agent</span>
                    <span>
                      {run.agent?.avatar ?? "🤖"} {run.agent?.name ?? "—"}
                    </span>
                  </div>
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
                </>
              ) : (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Source</span>
                  <span>{artifact.metadata?.uploaded ? "Manual upload" : "—"}</span>
                </div>
              )}
              {artifact.tags.length ? (
                <div className="space-y-1.5 pt-1">
                  <span className="text-muted-foreground">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {artifact.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
          {run ? (
            <Card>
              <CardHeader>
                <CardTitle>Run input</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 max-h-48 overflow-auto rounded-lg border p-3 text-xs">
                  {JSON.stringify(run.input ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
