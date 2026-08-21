"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EffortLevel, Json, Run, RunStatus } from "@/lib/types";
import { queryKeys } from "./keys";

const RUN_SELECT =
  "*, agent:agents(id, name, avatar), skill:skills(id, name, slug)";

export interface RunFilters {
  status?: RunStatus | "all";
  agentId?: string;
  skillId?: string;
  routineId?: string;
  limit?: number;
}

export function useRuns(workspaceId: string, filters: RunFilters = {}) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.runs(workspaceId, filters as Record<string, unknown>),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Run[]> => {
      let query = supabase
        .from("runs")
        .select(RUN_SELECT)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(filters.limit ?? 100);
      if (filters.status && filters.status !== "all")
        query = query.eq("status", filters.status);
      if (filters.agentId) query = query.eq("agent_id", filters.agentId);
      if (filters.skillId) query = query.eq("skill_id", filters.skillId);
      if (filters.routineId) query = query.eq("routine_id", filters.routineId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Run[];
    },
  });
}

export function useRun(workspaceId: string, runId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.run(workspaceId, runId),
    enabled: Boolean(workspaceId && runId),
    queryFn: async (): Promise<Run> => {
      const { data, error } = await supabase
        .from("runs")
        .select(RUN_SELECT)
        .eq("id", runId)
        .single();
      if (error) throw error;
      return data as unknown as Run;
    },
  });
}

/**
 * Subscribe to Postgres changes on this workspace's runs and invalidate the
 * relevant queries, so progress streams into every open view in real time.
 */
export function useRunsRealtime(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase
      .channel(`runs-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "runs",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["workspaces", workspaceId, "runs"],
          });
          queryClient.invalidateQueries({
            queryKey: ["workspaces", workspaceId, "artifacts"],
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.audit(workspaceId),
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient, workspaceId]);
}

export interface ExecuteRunPayload {
  workspace_id: string;
  agent_id: string;
  skill_id?: string | null;
  routine_id?: string | null;
  input?: Record<string, Json>;
  model?: string;
  effort?: EffortLevel;
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Request failed (${res.status})`
    );
  }
  return data as T;
}

export function useExecuteRun(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExecuteRunPayload) =>
      postJson<{ run_id: string }>("/api/runs/execute", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "runs"],
      });
    },
  });
}

export function useApproveRun(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      runId,
      decision,
    }: {
      runId: string;
      decision: "approve" | "reject";
    }) => postJson<{ ok: boolean }>(`/api/runs/${runId}/approve`, { decision }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "runs"],
      });
    },
  });
}

export function useCancelRun(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) =>
      postJson<{ ok: boolean }>(`/api/runs/${runId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "runs"],
      });
    },
  });
}
