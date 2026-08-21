"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  PaperclipIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { Markdown } from "@/components/shared/markdown";
import { RunStatusBadge } from "@/components/shared/status-badge";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAgents } from "@/lib/queries/use-agents";
import { useExecuteRun, useRuns } from "@/lib/queries/use-runs";
import {
  useDeleteSkill,
  useDeleteSkillReference,
  useSaveSkill,
  useSaveSkillReference,
  useSkill,
  useSkillReferences,
} from "@/lib/queries/use-skills";
import type { EffortLevel, Json, ReferenceType } from "@/lib/types";
import { formatRelative, slugify } from "@/lib/utils";

function parseJsonObject(text: string): Record<string, Json> | null {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    return parsed as Record<string, Json>;
  } catch {
    return null;
  }
}

const REF_TYPES: ReferenceType[] = ["markdown", "pdf", "html", "json", "image", "code", "url"];

export default function SkillEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const supabase = getSupabaseBrowserClient();

  const { data: skill, isLoading } = useSkill(workspace.id, id);
  const { data: agents } = useAgents(workspace.id);
  const { data: references } = useSkillReferences(id);
  const { data: skillRuns } = useRuns(workspace.id, { skillId: id, limit: 10 });
  const saveSkill = useSaveSkill(workspace.id);
  const deleteSkill = useDeleteSkill(workspace.id);
  const saveReference = useSaveSkillReference(id);
  const deleteReference = useDeleteSkillReference(id);
  const executeRun = useExecuteRun(workspace.id);

  // Editable state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [instructions, setInstructions] = useState("");
  const [inputSchemaText, setInputSchemaText] = useState("{}");
  const [outputSchemaText, setOutputSchemaText] = useState("{}");
  const [defaultAgentId, setDefaultAgentId] = useState<string>("none");
  const [isActive, setIsActive] = useState(true);
  const [versionNotes, setVersionNotes] = useState("");
  const [bumpVersion, setBumpVersion] = useState(false);
  const [previewInstructions, setPreviewInstructions] = useState(false);

  // Test run state
  const [testAgentId, setTestAgentId] = useState("");
  const [testEffort, setTestEffort] = useState<EffortLevel>("medium");
  const [testInput, setTestInput] = useState("{}");

  // Hydrate editor state once the skill loads (render-phase adjustment;
  // converges because `hydrated` flips to true).
  const [hydrated, setHydrated] = useState(false);
  if (skill && !hydrated) {
    setHydrated(true);
    setName(skill.name);
    setSlug(skill.slug);
    setDescription(skill.description);
    setCategory(skill.category);
    setTags(skill.tags.join(", "));
    setInstructions(skill.instructions_markdown);
    setInputSchemaText(JSON.stringify(skill.input_schema, null, 2));
    setOutputSchemaText(JSON.stringify(skill.output_schema, null, 2));
    setDefaultAgentId(skill.default_agent_id ?? "none");
    setIsActive(skill.is_active);
    setVersionNotes(skill.version_notes);
    setTestAgentId(skill.default_agent_id ?? "");
    setTestInput(JSON.stringify(exampleFromSchema(skill.input_schema), null, 2));
  }

  const inputSchemaValid = useMemo(
    () => parseJsonObject(inputSchemaText) !== null,
    [inputSchemaText]
  );
  const outputSchemaValid = useMemo(
    () => parseJsonObject(outputSchemaText) !== null,
    [outputSchemaText]
  );

  function handleSave() {
    const inputSchema = parseJsonObject(inputSchemaText);
    const outputSchema = parseJsonObject(outputSchemaText);
    if (!inputSchema || !outputSchema) {
      toast.error("Fix the JSON schema errors before saving");
      return;
    }
    saveSkill.mutate(
      {
        id,
        bumpVersion,
        values: {
          name,
          slug: slugify(slug || name),
          description,
          category: category || "general",
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          instructions_markdown: instructions,
          input_schema: inputSchema,
          output_schema: outputSchema,
          default_agent_id: defaultAgentId === "none" ? null : defaultAgentId,
          is_active: isActive,
          version_notes: versionNotes,
        },
      },
      {
        onSuccess: () => {
          toast.success(bumpVersion ? "Saved as new version" : "Skill saved");
          setBumpVersion(false);
        },
        onError: (error) => toast.error("Save failed", { description: error.message }),
      }
    );
  }

  function handleTestRun() {
    const input = parseJsonObject(testInput);
    if (input === null) {
      toast.error("Test input must be a JSON object");
      return;
    }
    if (!testAgentId) {
      toast.error("Pick an agent for the test run");
      return;
    }
    executeRun.mutate(
      {
        workspace_id: workspace.id,
        agent_id: testAgentId,
        skill_id: id,
        input,
        effort: testEffort,
      },
      {
        onSuccess: ({ run_id }) =>
          toast.success("Test run queued", {
            action: {
              label: "View run",
              onClick: () => router.push(`${base}/runs/${run_id}`),
            },
          }),
        onError: (error) => toast.error("Run failed", { description: error.message }),
      }
    );
  }

  async function handleReferenceUpload(file: File) {
    const path = `${workspace.id}/${id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from("skill-references")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) {
      toast.error("Upload failed", { description: error.message });
      return;
    }
    const type: ReferenceType = file.type.startsWith("image/")
      ? "image"
      : file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("html")
          ? "html"
          : file.type.includes("json")
            ? "json"
            : file.name.match(/\.(ts|tsx|js|py|sql|sh|rb|go|rs)$/)
              ? "code"
              : "markdown";
    saveReference.mutate(
      { name: file.name, type, storage_path: path, content_summary: "" },
      {
        onSuccess: () => toast.success("Reference added"),
        onError: (error) => toast.error("Could not save reference", { description: error.message }),
      }
    );
  }

  if (isLoading || !hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }
  if (!skill) {
    return (
      <EmptyState
        icon={FileTextIcon}
        title="Skill not found"
        action={
          <Button asChild variant="outline">
            <Link href={`${base}/skills`}>Back to skills</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm" aria-label="Back to skills">
          <Link href={`${base}/skills`}>
            <ArrowLeftIcon />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold">{name || "Untitled skill"}</h1>
            <Badge variant="muted">v{skill.version}</Badge>
            <Badge variant={isActive ? "success" : "muted"}>
              {isActive ? "active" : "draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground truncate text-sm">{skill.slug}</p>
        </div>
        {canEdit ? (
          <div className="flex items-center gap-3">
            <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Checkbox
                checked={bumpVersion}
                onCheckedChange={(v) => setBumpVersion(v === true)}
              />
              Bump version
            </label>
            <Button
              onClick={handleSave}
              disabled={saveSkill.isPending || !inputSchemaValid || !outputSchemaValid}
            >
              {saveSkill.isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
              Save
            </Button>
          </div>
        ) : null}
      </div>

      <Tabs defaultValue="instructions">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
          <TabsTrigger value="schemas">Schemas</TabsTrigger>
          <TabsTrigger value="references">
            References{references?.length ? ` (${references.length})` : ""}
          </TabsTrigger>
          <TabsTrigger value="test">Test run</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="instructions" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Markdown instructions the agent follows when running this skill.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewInstructions((v) => !v)}
            >
              {previewInstructions ? <PencilIcon /> : <EyeIcon />}
              {previewInstructions ? "Edit" : "Preview"}
            </Button>
          </div>
          {previewInstructions ? (
            <div className="min-h-96 rounded-xl border p-4">
              <Markdown>{instructions}</Markdown>
            </div>
          ) : (
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-96 font-mono text-xs"
              disabled={!canEdit}
              aria-label="Skill instructions markdown"
            />
          )}
        </TabsContent>

        <TabsContent value="schemas" className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Input schema (JSON Schema)</Label>
              {!inputSchemaValid ? (
                <Badge variant="destructive">Invalid JSON</Badge>
              ) : null}
            </div>
            <Textarea
              value={inputSchemaText}
              onChange={(e) => setInputSchemaText(e.target.value)}
              className="min-h-80 font-mono text-xs"
              disabled={!canEdit}
              aria-invalid={!inputSchemaValid}
              aria-label="Input schema"
            />
            <p className="text-muted-foreground text-xs">
              Drives the structured input form in Quick Run.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Output schema (JSON Schema)</Label>
              {!outputSchemaValid ? (
                <Badge variant="destructive">Invalid JSON</Badge>
              ) : null}
            </div>
            <Textarea
              value={outputSchemaText}
              onChange={(e) => setOutputSchemaText(e.target.value)}
              className="min-h-80 font-mono text-xs"
              disabled={!canEdit}
              aria-invalid={!outputSchemaValid}
              aria-label="Output schema"
            />
            <p className="text-muted-foreground text-xs">
              The structure the agent&apos;s output should conform to.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">
              Files and links the agent can consult: templates, rubrics, style guides.
            </p>
            {canEdit ? (
              <div className="flex items-center gap-2">
                <AddReferenceButton
                  onAdd={(values) =>
                    saveReference.mutate(values, {
                      onSuccess: () => toast.success("Reference added"),
                      onError: (error) =>
                        toast.error("Could not add reference", {
                          description: error.message,
                        }),
                    })
                  }
                />
                <label>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReferenceUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <UploadIcon /> Upload file
                    </span>
                  </Button>
                </label>
              </div>
            ) : null}
          </div>
          {!references?.length ? (
            <EmptyState
              icon={PaperclipIcon}
              title="No references yet"
              description="Upload files or add links to ground this skill in your own materials."
            />
          ) : (
            <ul className="divide-y rounded-xl border">
              {references.map((ref) => (
                <li key={ref.id} className="flex items-center gap-3 px-4 py-3">
                  <PaperclipIcon className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{ref.name}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {ref.type}
                      {ref.url ? ` · ${ref.url}` : ""}
                      {ref.content_summary ? ` · ${ref.content_summary}` : ""}
                    </p>
                  </div>
                  {canEdit ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Delete ${ref.name}`}
                      onClick={() =>
                        deleteReference.mutate(ref.id, {
                          onSuccess: () => toast.success("Reference removed"),
                        })
                      }
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="test" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Run a test</CardTitle>
              <CardDescription>
                Executes through the same runner and approval gate as production runs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Agent</Label>
                  <Select value={testAgentId} onValueChange={setTestAgentId}>
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
                  <Label>Effort</Label>
                  <Select
                    value={testEffort}
                    onValueChange={(v) => setTestEffort(v as EffortLevel)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["low", "medium", "high", "max"] as const).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Input (JSON)</Label>
                <Textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="min-h-32 font-mono text-xs"
                />
              </div>
              <Button onClick={handleTestRun} disabled={executeRun.isPending}>
                {executeRun.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <PlayIcon />
                )}
                Run test
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent runs of this skill</CardTitle>
            </CardHeader>
            <CardContent>
              {!skillRuns?.length ? (
                <p className="text-muted-foreground text-sm">No runs yet.</p>
              ) : (
                <ul className="divide-y">
                  {skillRuns.map((run) => (
                    <li key={run.id}>
                      <Link
                        href={`${base}/runs/${run.id}`}
                        className="hover:bg-accent/50 -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {run.agent?.name ?? "Agent"} · {formatRelative(run.created_at)}
                          </p>
                        </div>
                        <RunStatusBadge status={run.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Name</Label>
                <Input
                  id="skill-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-slug">Slug</Label>
                <Input
                  id="skill-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="skill-description">Description</Label>
                <Textarea
                  id="skill-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-category">Category</Label>
                <Input
                  id="skill-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill-tags">Tags</Label>
                <Input
                  id="skill-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="research, daily"
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label>Default agent</Label>
                <Select
                  value={defaultAgentId}
                  onValueChange={setDefaultAgentId}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(agents ?? []).map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.avatar ?? "🤖"} {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch
                  id="skill-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={!canEdit}
                />
                <Label htmlFor="skill-active" className="font-normal">
                  Active (runnable)
                </Label>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="skill-notes">Version notes</Label>
                <Textarea
                  id="skill-notes"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  placeholder="What changed in this version?"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/40">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!canEdit}>
                    <Trash2Icon /> Delete skill
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {skill.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Routines using this skill will stop working. Past runs keep their
                      history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() =>
                        deleteSkill.mutate(skill, {
                          onSuccess: () => {
                            toast.success("Skill deleted");
                            router.push(`${base}/skills`);
                          },
                          onError: (error) =>
                            toast.error("Delete failed", { description: error.message }),
                        })
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddReferenceButton({
  onAdd,
}: {
  onAdd: (values: {
    name: string;
    type: ReferenceType;
    url?: string | null;
    content_summary?: string;
  }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [refName, setRefName] = useState("");
  const [refType, setRefType] = useState<ReferenceType>("url");
  const [refUrl, setRefUrl] = useState("");
  const [refSummary, setRefSummary] = useState("");

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <PlusIcon /> Add link
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg border p-2">
      <div className="space-y-1">
        <Label className="text-xs">Name</Label>
        <Input
          value={refName}
          onChange={(e) => setRefName(e.target.value)}
          className="h-8 w-36 text-xs"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <Select value={refType} onValueChange={(v) => setRefType(v as ReferenceType)}>
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REF_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">URL</Label>
        <Input
          value={refUrl}
          onChange={(e) => setRefUrl(e.target.value)}
          className="h-8 w-44 text-xs"
          placeholder="https://…"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Summary</Label>
        <Input
          value={refSummary}
          onChange={(e) => setRefSummary(e.target.value)}
          className="h-8 w-44 text-xs"
        />
      </div>
      <Button
        size="sm"
        onClick={() => {
          if (!refName.trim()) {
            toast.error("Reference needs a name");
            return;
          }
          onAdd({
            name: refName,
            type: refType,
            url: refUrl || null,
            content_summary: refSummary,
          });
          setOpen(false);
          setRefName("");
          setRefUrl("");
          setRefSummary("");
        }}
      >
        Add
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}

/** Build an example input object from a JSON schema's properties/defaults. */
function exampleFromSchema(schema: Record<string, Json>): Record<string, Json> {
  const props = (schema?.properties ?? {}) as Record<
    string,
    { type?: string; default?: Json; enum?: Json[] }
  >;
  const example: Record<string, Json> = {};
  for (const [key, prop] of Object.entries(props)) {
    if (prop.default !== undefined) example[key] = prop.default;
    else if (prop.enum?.length) example[key] = prop.enum[0];
    else if (prop.type === "boolean") example[key] = false;
    else if (prop.type === "number" || prop.type === "integer") example[key] = 0;
    else example[key] = "";
  }
  return example;
}
