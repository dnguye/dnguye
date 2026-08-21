"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { recordAudit } from "@/lib/audit";
import type { SkillFormValues } from "@/lib/schemas";
import type { Skill, SkillReference } from "@/lib/types";
import { queryKeys } from "./keys";

export function useSkills(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.skills(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Skill[]> => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name");
      if (error) throw error;
      return (data ?? []) as Skill[];
    },
  });
}

export function useSkill(workspaceId: string, skillId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.skill(workspaceId, skillId),
    enabled: Boolean(workspaceId && skillId),
    queryFn: async (): Promise<Skill> => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", skillId)
        .single();
      if (error) throw error;
      return data as Skill;
    },
  });
}

/** Per-skill run counts and last-run info for catalog statistics. */
export interface SkillRunStats {
  skill_id: string;
  total: number;
  succeeded: number;
  failed: number;
  last_run_at: string | null;
}

export function useSkillRunStats(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.skillRunStats(workspaceId),
    enabled: Boolean(workspaceId),
    queryFn: async (): Promise<Record<string, SkillRunStats>> => {
      const { data, error } = await supabase
        .from("runs")
        .select("skill_id, status, created_at")
        .eq("workspace_id", workspaceId)
        .not("skill_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const stats: Record<string, SkillRunStats> = {};
      for (const row of data ?? []) {
        const id = row.skill_id as string;
        stats[id] ??= {
          skill_id: id,
          total: 0,
          succeeded: 0,
          failed: 0,
          last_run_at: row.created_at as string,
        };
        stats[id].total += 1;
        if (row.status === "succeeded") stats[id].succeeded += 1;
        if (row.status === "failed") stats[id].failed += 1;
      }
      return stats;
    },
  });
}

export function useSaveSkill(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
      bumpVersion,
    }: {
      id?: string;
      values: SkillFormValues;
      bumpVersion?: boolean;
    }): Promise<Skill> => {
      if (id) {
        const patch: Record<string, unknown> = { ...values };
        if (bumpVersion) {
          const { data: current } = await supabase
            .from("skills")
            .select("version")
            .eq("id", id)
            .single();
          patch.version = ((current?.version as number) ?? 1) + 1;
        }
        const { data, error } = await supabase
          .from("skills")
          .update(patch)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        await recordAudit(supabase, {
          workspace_id: workspaceId,
          event_type: "skill.updated",
          entity_type: "skill",
          entity_id: id,
          payload: { name: values.name, version: (patch.version as number) ?? null },
        });
        return data as Skill;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("skills")
        .insert({ ...values, workspace_id: workspaceId, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      const skill = data as Skill;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "skill.created",
        entity_type: "skill",
        entity_id: skill.id,
        payload: { name: skill.name },
      });
      return skill;
    },
    onSuccess: (skill) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills(workspaceId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.skill(workspaceId, skill.id),
      });
    },
  });
}

export function useDeleteSkill(workspaceId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (skill: Pick<Skill, "id" | "name">) => {
      const { error } = await supabase.from("skills").delete().eq("id", skill.id);
      if (error) throw error;
      await recordAudit(supabase, {
        workspace_id: workspaceId,
        event_type: "skill.deleted",
        entity_type: "skill",
        entity_id: skill.id,
        payload: { name: skill.name },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills(workspaceId) });
    },
  });
}

export function useSkillReferences(skillId: string) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: queryKeys.skillReferences(skillId),
    enabled: Boolean(skillId),
    queryFn: async (): Promise<SkillReference[]> => {
      const { data, error } = await supabase
        .from("skill_references")
        .select("*")
        .eq("skill_id", skillId)
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as SkillReference[];
    },
  });
}

export function useSaveSkillReference(skillId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      name: string;
      type: SkillReference["type"];
      url?: string | null;
      storage_path?: string | null;
      content_summary?: string;
    }) => {
      const { error } = await supabase
        .from("skill_references")
        .insert({ ...values, skill_id: skillId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillReferences(skillId) });
    },
  });
}

export function useDeleteSkillReference(skillId: string) {
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skill_references").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skillReferences(skillId) });
    },
  });
}
