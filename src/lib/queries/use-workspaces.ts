"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/lib/types";
import { queryKeys } from "./keys";

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
}

export function useWorkspaces() {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: async (): Promise<WorkspaceWithRole[]> => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("role, workspace:workspaces(*)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.workspace)
        .map((row) => ({
          ...(row.workspace as unknown as Workspace),
          role: row.role as WorkspaceRole,
        }));
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.members(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<WorkspaceMember[]> => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*, profile:profiles(*)")
        .eq("workspace_id", workspaceId);
      if (error) throw error;
      return (data ?? []) as WorkspaceMember[];
    },
  });
}

export function useCreateWorkspace() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: { name: string; slug: string }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ ...values, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      const workspace = data as Workspace;
      await recordAudit(supabase, {
        workspace_id: workspace.id,
        event_type: "workspace.created",
        entity_type: "workspace",
        entity_id: workspace.id,
        payload: { name: workspace.name },
      });
      return workspace;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}

export function useSeedDemoWorkspace() {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{ workspace_id: string; slug: string }> => {
      const { data, error } = await supabase.rpc("seed_demo_workspace");
      if (error) throw error;
      return data as { workspace_id: string; slug: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces });
    },
  });
}
