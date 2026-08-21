"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlayIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAgents } from "@/lib/queries/use-agents";
import { useSkills } from "@/lib/queries/use-skills";
import { useExecuteRun } from "@/lib/queries/use-runs";
import {
  EFFORT_LEVELS,
  SIMULATED_MODELS,
  type EffortLevel,
  type Json,
} from "@/lib/types";
import { useWorkspace } from "./workspace-provider";

interface SchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
  default?: Json;
}

/**
 * Quick Run: pick an agent, skill, model and effort, fill structured inputs
 * derived from the skill's input JSON schema, and queue a run.
 */
export function QuickRunDialog({
  open,
  onOpenChange,
  initialSkillId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSkillId?: string | null;
}) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { data: agents } = useAgents(workspace.id);
  const { data: skills } = useSkills(workspace.id);
  const executeRun = useExecuteRun(workspace.id);

  const [skillId, setSkillId] = useState<string>("none");
  const [agentId, setAgentId] = useState<string>("");
  const [model, setModel] = useState<string>("simulated-large");
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [fieldValues, setFieldValues] = useState<Record<string, Json>>({});
  const [rawInput, setRawInput] = useState("");
  const [useRawInput, setUseRawInput] = useState(false);

  const activeAgents = useMemo(
    () => (agents ?? []).filter((a) => a.status !== "archived"),
    [agents]
  );
  const activeSkills = useMemo(
    () => (skills ?? []).filter((s) => s.is_active),
    [skills]
  );
  const skill = activeSkills.find((s) => s.id === skillId) ?? null;

  const schemaFields = useMemo(() => {
    const props = (skill?.input_schema?.properties ?? {}) as Record<
      string,
      SchemaProperty
    >;
    const required = (skill?.input_schema?.required ?? []) as string[];
    return Object.entries(props).map(([key, prop]) => ({
      key,
      prop,
      required: required.includes(key),
    }));
  }, [skill]);

  // Reset when opening / when a skill is preselected (render-phase adjustment).
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const preSkill = activeSkills.find((s) => s.id === initialSkillId);
      setSkillId(preSkill?.id ?? "none");
      const agent =
        activeAgents.find((a) => a.id === preSkill?.default_agent_id) ?? activeAgents[0];
      setAgentId(agent?.id ?? "");
      setModel(agent?.model ?? "simulated-large");
      setEffort(agent?.default_effort ?? "medium");
      setFieldValues({});
      setRawInput("");
      setUseRawInput(false);
    }
  }
  // If the dialog opened before agents finished loading, pick a default once
  // they arrive (converges: agentId becomes non-empty).
  if (open && !agentId && activeAgents.length) {
    const preSkill = activeSkills.find((s) => s.id === initialSkillId);
    const agent =
      activeAgents.find((a) => a.id === preSkill?.default_agent_id) ?? activeAgents[0];
    setAgentId(agent.id);
    setModel(agent.model);
    setEffort(agent.default_effort);
  }

  // Skill change updates default agent.
  function handleSkillChange(next: string) {
    setSkillId(next);
    setFieldValues({});
    const nextSkill = activeSkills.find((s) => s.id === next);
    if (nextSkill?.default_agent_id) {
      const agent = activeAgents.find((a) => a.id === nextSkill.default_agent_id);
      if (agent) {
        setAgentId(agent.id);
        setModel(agent.model);
        setEffort(agent.default_effort);
      }
    }
  }

  function buildInput(): Record<string, Json> | null {
    if (useRawInput) {
      if (!rawInput.trim()) return {};
      try {
        const parsed = JSON.parse(rawInput);
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          toast.error("Input must be a JSON object");
          return null;
        }
        return parsed as Record<string, Json>;
      } catch {
        toast.error("Input is not valid JSON");
        return null;
      }
    }
    const missing = schemaFields.filter(
      (f) =>
        f.required &&
        (fieldValues[f.key] === undefined ||
          fieldValues[f.key] === "" ||
          fieldValues[f.key] === null)
    );
    if (missing.length) {
      toast.error(`Missing required input: ${missing.map((f) => f.key).join(", ")}`);
      return null;
    }
    return fieldValues;
  }

  function handleRun() {
    if (!agentId) {
      toast.error("Pick an agent");
      return;
    }
    const input = buildInput();
    if (input === null) return;
    executeRun.mutate(
      {
        workspace_id: workspace.id,
        agent_id: agentId,
        skill_id: skillId === "none" ? null : skillId,
        input,
        model,
        effort,
      },
      {
        onSuccess: ({ run_id }) => {
          onOpenChange(false);
          toast.success("Run queued", {
            description: "Progress streams into the run log in real time.",
            action: {
              label: "View run",
              onClick: () => router.push(`/w/${workspace.slug}/runs/${run_id}`),
            },
          });
        },
        onError: (error) => toast.error("Run failed to start", { description: error.message }),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick run</DialogTitle>
          <DialogDescription>
            Queue an agent run. Write actions will pause for approval before touching
            anything external.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an agent" />
                </SelectTrigger>
                <SelectContent>
                  {activeAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <span>{agent.avatar ?? "🤖"}</span> {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={skillId} onValueChange={handleSkillChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Optional skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ad-hoc (no skill)</SelectItem>
                  {activeSkills.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIMULATED_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Effort</Label>
              <Select value={effort} onValueChange={(v) => setEffort(v as EffortLevel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EFFORT_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {skill && schemaFields.length > 0 && !useRawInput ? (
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Inputs — {skill.name}
              </p>
              {schemaFields.map(({ key, prop, required }) => (
                <div key={key} className="space-y-1.5">
                  <Label htmlFor={`qr-${key}`} className="gap-1">
                    {key}
                    {required ? <span className="text-destructive">*</span> : null}
                  </Label>
                  {prop.enum ? (
                    <Select
                      value={(fieldValues[key] as string) ?? ""}
                      onValueChange={(v) =>
                        setFieldValues((prev) => ({ ...prev, [key]: v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={prop.description ?? key} />
                      </SelectTrigger>
                      <SelectContent>
                        {prop.enum.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : prop.type === "boolean" ? (
                    <div className="flex items-center gap-2 pt-1">
                      <Switch
                        id={`qr-${key}`}
                        checked={Boolean(fieldValues[key])}
                        onCheckedChange={(v) =>
                          setFieldValues((prev) => ({ ...prev, [key]: v }))
                        }
                      />
                      <span className="text-muted-foreground text-xs">
                        {prop.description ?? ""}
                      </span>
                    </div>
                  ) : (
                    <Input
                      id={`qr-${key}`}
                      type={prop.type === "number" || prop.type === "integer" ? "number" : "text"}
                      placeholder={prop.description ?? ""}
                      value={(fieldValues[key] as string) ?? ""}
                      onChange={(e) =>
                        setFieldValues((prev) => ({
                          ...prev,
                          [key]:
                            prop.type === "number" || prop.type === "integer"
                              ? Number(e.target.value)
                              : e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="raw-json" checked={useRawInput} onCheckedChange={setUseRawInput} />
              <Label htmlFor="raw-json" className="text-muted-foreground font-normal">
                Raw JSON input
              </Label>
            </div>
          </div>
          {useRawInput ? (
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder='{"topic": "..."}'
              className="min-h-24 font-mono text-xs"
            />
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRun} disabled={executeRun.isPending}>
            {executeRun.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <PlayIcon />
            )}
            Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
