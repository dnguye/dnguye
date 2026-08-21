"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { Connection } from "@/lib/types";
import { queryKeys } from "./keys";

export function useConnections(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.connections(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Connection[]> => {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("display_name");
      if (error) throw error;
      return (data ?? []) as Connection[];
    },
  });
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

/**
 * Kick off the (stubbed) OAuth flow for a provider. The server-side adapter
 * decides whether to redirect to a real consent screen or simulate one in
 * development; tokens are stored server-side only.
 */
export function useConnectProvider(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { connection_id?: string; provider: string; display_name?: string }) =>
      postJson<{ status: string; authorize_url?: string }>(
        "/api/connections/authorize",
        { ...payload, workspace_id: workspaceId }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections(workspaceId) });
    },
  });
}

export function useDisconnectProvider(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connection: Connection) => {
      const { error } = await supabase
        .from("connections")
        .update({
          status: "disconnected",
          encrypted_credentials_reference: null,
          last_sync_at: null,
        })
        .eq("id", connection.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "connection.disconnected",
        entity_type: "connection",
        entity_id: connection.id,
        payload: { provider: connection.provider },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections(workspaceId) });
    },
  });
}

export function useUpdateConnection(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string;
      values: Partial<Pick<Connection, "display_name" | "allowed_agent_ids" | "scopes">>;
    }) => {
      const { error } = await supabase.from("connections").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.connections(workspaceId) });
    },
  });
}
