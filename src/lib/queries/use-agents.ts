"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { AgentFormValues } from "@/lib/schemas";
import type { Agent } from "@/lib/types";
import { queryKeys } from "./keys";

export function useAgents(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.agents(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Agent[]> => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Agent[];
    },
  });
}

export function useAgent(workspaceId: string, agentId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.agent(workspaceId, agentId),
    enabled: Boolean(workspaceId && agentId),
    queryFn: async (): Promise<Agent> => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .single();
      if (error) throw error;
      return data as Agent;
    },
  });
}

export function useSaveAgent(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: AgentFormValues;
    }): Promise<Agent> => {
      if (id) {
        const { data, error } = await supabase
          .from("agents")
          .update(values)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        await recordAudit(supabase, {
          workspace_id: workspaceId,
          event_type: "agent.updated",
          entity_type: "agent",
          entity_id: id,
          payload: { name: values.name },
        });
        return data as Agent;
      }
      const { data, error } = await supabase
        .from("agents")
        .insert({ ...values, workspace_id: workspaceId })
        .select()
        .single();
      if (error) throw error;
      const agent = data as Agent;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "agent.created",
        entity_type: "agent",
        entity_id: agent.id,
        payload: { name: agent.name },
      });
      return agent;
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents(workspaceId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.agent(workspaceId, agent.id),
      });
    },
  });
}

export function useDeleteAgent(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Pick<Agent, "id" | "name">) => {
      const { error } = await supabase.from("agents").delete().eq("id", agent.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "agent.deleted",
        entity_type: "agent",
        entity_id: agent.id,
        payload: { name: agent.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agents(workspaceId) });
    },
  });
}
