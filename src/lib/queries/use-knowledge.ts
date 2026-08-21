"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { KnowledgeEdge, KnowledgeNode } from "@/lib/types";
import { queryKeys } from "./keys";

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export function useKnowledgeGraph(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.knowledge(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<KnowledgeGraph> => {
      const [nodesRes, edgesRes] = await Promise.all([
        supabase
          .from("knowledge_nodes")
          .select("*")
          .eq("workspace_id", workspaceId),
        supabase
          .from("knowledge_edges")
          .select("*")
          .eq("workspace_id", workspaceId),
      ]);
      if (nodesRes.error) throw nodesRes.error;
      if (edgesRes.error) throw edgesRes.error;
      return {
        nodes: (nodesRes.data ?? []) as KnowledgeNode[],
        edges: (edgesRes.data ?? []) as KnowledgeEdge[],
      };
    },
  });
}

export function useSaveKnowledgeNode(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Partial<KnowledgeNode>;
    }) => {
      if (id) {
        const { error } = await supabase
          .from("knowledge_nodes")
          .update(values)
          .eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("knowledge_nodes")
        .insert({ ...values, workspace_id: workspaceId })
        .select("id")
        .single();
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "knowledge.node_created",
        entity_type: "knowledge_node",
        entity_id: data.id as string,
        payload: { title: values.title ?? "" },
      });
      return data.id as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge(workspaceId) });
    },
  });
}

/** Persist node positions after dragging (batched, no invalidation churn). */
export function useSaveNodePositions(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useMutation({
    mutationKey: ["save-node-positions", workspaceId],
    mutationFn: async (positions: Array<{ id: string; x: number; y: number }>) => {
      await Promise.all(
        positions.map(({ id, x, y }) =>
          supabase.from("knowledge_nodes").update({ position: { x, y } }).eq("id", id)
        )
      );
    },
  });
}

export function useSaveKnowledgeEdge(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      source_node_id: string;
      target_node_id: string;
      relation_type?: string;
    }) => {
      const { error } = await supabase.from("knowledge_edges").insert({
        ...values,
        relation_type: values.relation_type ?? "related_to",
        workspace_id: workspaceId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge(workspaceId) });
    },
  });
}

export function useDeleteKnowledgeNode(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_nodes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.knowledge(workspaceId) });
    },
  });
}
