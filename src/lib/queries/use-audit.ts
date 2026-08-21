"use client";

import { useQuery } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AuditEvent } from "@/lib/types";
import { queryKeys } from "./keys";

export function useAuditEvents(workspaceId: string, limit = 50) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: [...queryKeys.audit(workspaceId), limit],
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<AuditEvent[]> => {
      const { data, error } = await supabase
        .from("audit_events")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as AuditEvent[];
    },
  });
}
