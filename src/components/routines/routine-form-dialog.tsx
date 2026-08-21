"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
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
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { CRON_PRESETS, computeNextRun, describeCron, isValidCron } from "@/lib/cron";
import { routineSchema } from "@/lib/schemas";
import { useAgents } from "@/lib/queries/use-agents";
import { useSaveRoutine } from "@/lib/queries/use-routines";
import { useSkills } from "@/lib/queries/use-skills";
import type { Routine } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function RoutineFormDialog({
  open,
  onOpenChange,
  routine,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routine?: Routine | null;
}) {
  const { workspace } = useWorkspace();
  const { data: agents } = useAgents(workspace.id);
  const { data: skills } = useSkills(workspace.id);
  const saveRoutine = useSaveRoutine(workspace.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cron, setCron] = useState("0 9 * * 1-5");
  const [timezone, setTimezone] = useState("UTC");
  const [agentId, setAgentId] = useState("");
  const [skillId, setSkillId] = useState("");
  const [inputText, setInputText] = useState("{}");
  const [enabled, setEnabled] = useState(true);
  const [deliveryType, setDeliveryType] = useState("artifact_library");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [approvalPolicy, setApprovalPolicy] = useState<"auto" | "require_approval">("auto");

  // Re-initialize the form whenever the dialog opens (render-phase adjustment).
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) initialize();
  }
  function initialize() {
    setName(routine?.name ?? "");
    setDescription(routine?.description ?? "");
    setCron(routine?.schedule_cron ?? "0 9 * * 1-5");
    setTimezone(routine?.timezone ?? "UTC");
    setAgentId(routine?.agent_id ?? "");
    setSkillId(routine?.skill_id ?? "");
    setInputText(JSON.stringify(routine?.input ?? {}, null, 2));
    setEnabled(routine?.enabled ?? true);
    setDeliveryType(routine?.delivery_target?.type ?? "artifact_library");
    setDeliveryAddress(routine?.delivery_target?.address ?? "");
    setApprovalPolicy(routine?.approval_policy ?? "auto");
  }

  const cronValid = isValidCron(cron);
  const nextRun = cronValid ? computeNextRun(cron, timezone) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let input: Record<string, unknown>;
    try {
      input = JSON.parse(inputText || "{}");
    } catch {
      toast.error("Input payload must be valid JSON");
      return;
    }
    const parsed = routineSchema.safeParse({
      name,
      description,
      schedule_cron: cron,
      timezone,
      agent_id: agentId,
      skill_id: skillId,
      input,
      enabled,
      delivery_target: {
        type: deliveryType,
        ...(deliveryAddress ? { address: deliveryAddress } : {}),
      },
      approval_policy: approvalPolicy,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid routine");
      return;
    }
    saveRoutine.mutate(
      { id: routine?.id, values: parsed.data },
      {
        onSuccess: () => {
          toast.success(routine ? "Routine updated" : "Routine created");
          onOpenChange(false);
        },
        onError: (error) => toast.error("Save failed", { description: error.message }),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{routine ? "Edit routine" : "New routine"}</DialogTitle>
          <DialogDescription>
            Scheduled work runs server-side on a cron cadence — no browser needed.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routine-name">Name</Label>
            <Input
              id="routine-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Morning briefing"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine-description">Description</Label>
            <Textarea
              id="routine-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an agent" />
                </SelectTrigger>
                <SelectContent>
                  {(agents ?? [])
                    .filter((a) => a.status !== "archived")
                    .map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.avatar ?? "🤖"} {agent.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a skill" />
                </SelectTrigger>
                <SelectContent>
                  {(skills ?? [])
                    .filter((s) => s.is_active)
                    .map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Schedule preset</Label>
              <Select
                value={CRON_PRESETS.find((p) => p.value === cron)?.value ?? "custom"}
                onValueChange={(v) => {
                  if (v !== "custom") setCron(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRON_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routine-cron">Cron expression</Label>
              <Input
                id="routine-cron"
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                className="font-mono"
                aria-invalid={!cronValid}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-muted-foreground flex flex-col justify-end gap-1 pb-1 text-xs">
              <span>{cronValid ? describeCron(cron) : "Invalid cron expression"}</span>
              <span>{nextRun ? `Next: ${formatDateTime(nextRun)}` : ""}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine-input">Input payload (JSON)</Label>
            <Textarea
              id="routine-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-20 font-mono text-xs"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Delivery destination</Label>
              <Select value={deliveryType} onValueChange={setDeliveryType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artifact_library">Artifact library</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="notion">Notion</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {deliveryType !== "artifact_library" ? (
              <div className="space-y-2">
                <Label htmlFor="routine-address">Destination address</Label>
                <Input
                  id="routine-address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={
                    deliveryType === "email" ? "team@example.com" : "#channel or URL"
                  }
                />
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Run policy</Label>
              <Select
                value={approvalPolicy}
                onValueChange={(v) => setApprovalPolicy(v as "auto" | "require_approval")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Run automatically</SelectItem>
                  <SelectItem value="require_approval">Require approval</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch id="routine-enabled" checked={enabled} onCheckedChange={setEnabled} />
              <Label htmlFor="routine-enabled" className="font-normal">
                Enabled
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveRoutine.isPending || !cronValid}>
              {saveRoutine.isPending ? <Loader2Icon className="animate-spin" /> : null}
              {routine ? "Save changes" : "Create routine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
