"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { Artifact, ArtifactType } from "@/lib/types";
import { queryKeys } from "./keys";

export interface ArtifactFilters {
  search?: string;
  type?: ArtifactType | "all";
  limit?: number;
}

export function useArtifacts(workspaceId: string, filters: ArtifactFilters = {}) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.artifacts(workspaceId, filters as Record<string, unknown>),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Artifact[]> => {
      let query = supabase
        .from("artifacts")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(filters.limit ?? 60);
      if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
      if (filters.search?.trim()) {
        const term = filters.search.trim().replace(/[%_]/g, "");
        query = query.or(
          `title.ilike.%${term}%,searchable_text.ilike.%${term}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Artifact[];
    },
  });
}

export function useArtifact(workspaceId: string, artifactId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.artifact(workspaceId, artifactId),
    enabled: Boolean(workspaceId && artifactId),
    queryFn: async (): Promise<Artifact> => {
      const { data, error } = await supabase
        .from("artifacts")
        .select("*")
        .eq("id", artifactId)
        .single();
      if (error) throw error;
      return data as Artifact;
    },
  });
}

const TYPE_BY_MIME: Array<[RegExp, ArtifactType]> = [
  [/^image\//, "image"],
  [/^text\/html/, "html"],
  [/^application\/json/, "json"],
  [/^text\/csv/, "csv"],
  [/^application\/pdf/, "pdf"],
  [/^text\/markdown/, "markdown"],
];

export function useUploadArtifact(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      const path = `${workspaceId}/${crypto.randomUUID()}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("artifacts")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (uploadError) throw uploadError;

      const mime = file.type || "application/octet-stream";
      const type = TYPE_BY_MIME.find(([re]) => re.test(mime))?.[1] ?? "other";
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("artifacts")
        .insert({
          workspace_id: workspaceId,
          title: title || file.name,
          type,
          mime_type: mime,
          storage_path: path,
          metadata: { size: file.size, uploaded: true },
          searchable_text: file.name,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      const artifact = data as Artifact;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "artifact.uploaded",
        entity_type: "artifact",
        entity_id: artifact.id,
        payload: { title: artifact.title, mime },
      });
      return artifact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "artifacts"],
      });
    },
  });
}

export function useDeleteArtifact(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (artifact: Artifact) => {
      if (artifact.storage_path) {
        await supabase.storage.from("artifacts").remove([artifact.storage_path]);
      }
      const { error } = await supabase.from("artifacts").delete().eq("id", artifact.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "artifact.deleted",
        entity_type: "artifact",
        entity_id: artifact.id,
        payload: { title: artifact.title },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "artifacts"],
      });
    },
  });
}

/** Signed URL for a stored artifact (private bucket). */
export async function getArtifactSignedUrl(
  workspaceId: string,
  storagePath: string
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.storage
    .from("artifacts")
    .createSignedUrl(storagePath, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
