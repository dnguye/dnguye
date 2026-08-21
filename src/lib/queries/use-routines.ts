"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import { computeNextRun } from "@/lib/cron";
import type { RoutineFormValues } from "@/lib/schemas";
import type { Routine } from "@/lib/types";
import { queryKeys } from "./keys";

export function useRoutines(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.routines(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Routine[]> => {
      const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Routine[];
    },
  });
}

export function useSaveRoutine(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: RoutineFormValues;
    }): Promise<Routine> => {
      const next_run_at = values.enabled
        ? computeNextRun(values.schedule_cron, values.timezone)?.toISOString() ?? null
        : null;
      const payload = { ...values, next_run_at };
      if (id) {
        const { data, error } = await supabase
          .from("routines")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        await recordAudit(supabase, {
          workspace_id: workspaceId,
          event_type: "routine.updated",
          entity_type: "routine",
          entity_id: id,
          payload: { name: values.name },
        });
        return data as Routine;
      }
      const { data, error } = await supabase
        .from("routines")
        .insert({ ...payload, workspace_id: workspaceId })
        .select()
        .single();
      if (error) throw error;
      const routine = data as Routine;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "routine.created",
        entity_type: "routine",
        entity_id: routine.id,
        payload: { name: routine.name },
      });
      return routine;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines(workspaceId) });
    },
  });
}

export function useToggleRoutine(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (routine: Routine) => {
      const enabled = !routine.enabled;
      const next_run_at = enabled
        ? computeNextRun(routine.schedule_cron, routine.timezone)?.toISOString() ?? null
        : null;
      const { error } = await supabase
        .from("routines")
        .update({ enabled, next_run_at })
        .eq("id", routine.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: enabled ? "routine.enabled" : "routine.disabled",
        entity_type: "routine",
        entity_id: routine.id,
        payload: { name: routine.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines(workspaceId) });
    },
  });
}

export function useDeleteRoutine(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (routine: Pick<Routine, "id" | "name">) => {
      const { error } = await supabase.from("routines").delete().eq("id", routine.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "routine.deleted",
        entity_type: "routine",
        entity_id: routine.id,
        payload: { name: routine.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines(workspaceId) });
    },
  });
}
