"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { agentSchema, type AgentFormValues } from "@/lib/schemas";
import { useSaveAgent } from "@/lib/queries/use-agents";
import { useConnections } from "@/lib/queries/use-connections";
import {
  EFFORT_LEVELS,
  SIMULATED_MODELS,
  type Agent,
  type EffortLevel,
} from "@/lib/types";

const AVAILABLE_TOOLS = [
  "web_search",
  "read_files",
  "write_artifacts",
  "organize_files",
  "send_email",
  "query_database",
];

export function AgentFormDialog({
  open,
  onOpenChange,
  agent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: Agent | null;
}) {
  const { workspace } = useWorkspace();
  const saveAgent = useSaveAgent(workspace.id);
  const { data: connections } = useConnections(workspace.id);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("🤖");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Agent["status"]>("active");
  const [model, setModel] = useState("simulated-large");
  const [effort, setEffort] = useState<EffortLevel>("medium");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [canWriteExternal, setCanWriteExternal] = useState(false);
  const [allowedConnections, setAllowedConnections] = useState<string[]>([]);
  const [tags, setTags] = useState("");

  // Re-initialize the form whenever the dialog opens (render-phase adjustment).
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) initialize();
  }
  function initialize() {
    setName(agent?.name ?? "");
    setAvatar(agent?.avatar ?? "🤖");
    setDescription(agent?.description ?? "");
    setStatus(agent?.status ?? "active");
    setModel(agent?.model ?? "simulated-large");
    setEffort(agent?.default_effort ?? "medium");
    setSystemPrompt(agent?.system_prompt ?? "");
    setTools(agent?.enabled_tools ?? []);
    setCanWriteExternal(agent?.permissions?.can_write_external ?? false);
    setAllowedConnections(agent?.permissions?.allowed_connections ?? []);
    setTags(agent?.tags?.join(", ") ?? "");
  }

  function toggle(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values: AgentFormValues = {
      name,
      avatar,
      description,
      status,
      provider: agent?.provider ?? "simulated",
      model,
      default_effort: effort,
      system_prompt: systemPrompt,
      enabled_tools: tools,
      permissions: {
        can_write_external: canWriteExternal,
        allowed_connections: allowedConnections,
      },
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const parsed = agentSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid agent");
      return;
    }
    saveAgent.mutate(
      { id: agent?.id, values: parsed.data },
      {
        onSuccess: () => {
          toast.success(agent ? "Agent updated" : "Agent created");
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
          <DialogTitle>{agent ? "Edit agent" : "New agent"}</DialogTitle>
          <DialogDescription>
            Configure the model, system prompt, permitted tools, and permission profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[4rem_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="agent-avatar">Avatar</Label>
              <Input
                id="agent-avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="text-center text-lg"
                maxLength={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input
                id="agent-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Atlas"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Textarea
              id="agent-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this agent good at?"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Agent["status"]) }>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
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
              <Label>Default effort</Label>
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
          <div className="space-y-2">
            <Label htmlFor="agent-prompt">System prompt</Label>
            <Textarea
              id="agent-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-24 font-mono text-xs"
              placeholder="You are…"
            />
          </div>
          <div className="space-y-2">
            <Label>Permitted tools</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOOLS.map((tool) => (
                <label
                  key={tool}
                  className="bg-muted/40 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                >
                  <Checkbox
                    checked={tools.includes(tool)}
                    onCheckedChange={() => setTools((prev) => toggle(prev, tool))}
                  />
                  {tool}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-xs font-medium uppercase tracking-wide">
              Permission profile
            </p>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="agent-write" className="font-normal">
                  Can propose external writes
                </Label>
                <p className="text-muted-foreground text-xs">
                  Even when enabled, every external write still requires explicit human
                  approval before it runs.
                </p>
              </div>
              <Switch
                id="agent-write"
                checked={canWriteExternal}
                onCheckedChange={setCanWriteExternal}
              />
            </div>
            {connections?.length ? (
              <div className="space-y-1.5">
                <Label className="font-normal">Allowed connections</Label>
                <div className="flex flex-wrap gap-1.5">
                  {connections.map((connection) => (
                    <Badge
                      key={connection.id}
                      variant={
                        allowedConnections.includes(connection.provider)
                          ? "default"
                          : "muted"
                      }
                      className="cursor-pointer select-none"
                      onClick={() =>
                        setAllowedConnections((prev) => toggle(prev, connection.provider))
                      }
                    >
                      {connection.display_name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent-tags">Tags</Label>
            <Input
              id="agent-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="research, analysis"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveAgent.isPending}>
              {saveAgent.isPending ? <Loader2Icon className="animate-spin" /> : null}
              {agent ? "Save changes" : "Create agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
