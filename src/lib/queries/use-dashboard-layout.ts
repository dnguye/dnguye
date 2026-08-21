"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DashboardLayoutItem } from "@/lib/types";
import { queryKeys } from "./keys";

export function useDashboardLayout(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.dashboardLayout(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<DashboardLayoutItem[] | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("workspace_id", workspaceId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.layout as DashboardLayoutItem[] | undefined) ?? null;
    },
  });
}

export function useSaveDashboardLayout(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (layout: DashboardLayoutItem[]) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("dashboard_layouts").upsert({
        workspace_id: workspaceId,
        user_id: user.id,
        layout,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_, layout) => {
      queryClient.setQueryData(queryKeys.dashboardLayout(workspaceId), layout);
    },
  });
}
