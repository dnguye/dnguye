"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  type Connection as FlowConnection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BotIcon,
  BoxIcon,
  CompassIcon,
  FileBoxIcon,
  FolderIcon,
  NetworkIcon,
  PaperclipIcon,
  PlugIcon,
  PlusIcon,
  RouteIcon,
  SearchIcon,
  SparklesIcon,
  StickyNoteIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Markdown } from "@/components/shared/markdown";
import { PageHeader } from "@/components/shared/page-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  useDeleteKnowledgeNode,
  useKnowledgeGraph,
  useSaveKnowledgeEdge,
  useSaveKnowledgeNode,
  useSaveNodePositions,
} from "@/lib/queries/use-knowledge";
import type { KnowledgeNode, KnowledgeNodeType } from "@/lib/types";
import { cn } from "@/lib/utils";

const NODE_META: Record<
  KnowledgeNodeType,
  { icon: typeof BoxIcon; className: string }
> = {
  workspace: { icon: NetworkIcon, className: "border-primary/60 bg-primary/10" },
  project: { icon: FolderIcon, className: "border-chart-2/60 bg-chart-2/10" },
  agent: { icon: BotIcon, className: "border-chart-3/60 bg-chart-3/10" },
  skill: { icon: SparklesIcon, className: "border-chart-4/60 bg-chart-4/10" },
  routine: { icon: CompassIcon, className: "border-chart-5/60 bg-chart-5/10" },
  reference: { icon: PaperclipIcon, className: "border-border bg-muted/60" },
  artifact: { icon: FileBoxIcon, className: "border-chart-2/60 bg-card" },
  connection: { icon: PlugIcon, className: "border-border bg-card" },
  router: { icon: RouteIcon, className: "border-primary bg-primary/15" },
  note: { icon: StickyNoteIcon, className: "border-border bg-card" },
};

const NODE_TYPES_LIST = Object.keys(NODE_META) as KnowledgeNodeType[];

type GraphNodeData = {
  label: string;
  nodeType: KnowledgeNodeType;
  dimmed: boolean;
};

function GraphNode({ data, selected }: NodeProps) {
  const { label, nodeType, dimmed } = data as GraphNodeData;
  const meta = NODE_META[nodeType] ?? NODE_META.note;
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        "flex max-w-52 items-center gap-2 rounded-lg border px-3 py-2 text-xs shadow-sm transition-opacity",
        meta.className,
        selected && "ring-ring ring-2",
        dimmed && "opacity-25"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !size-1.5" />
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate font-medium">{label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !size-1.5" />
    </div>
  );
}

const nodeTypes = { knowledge: GraphNode };

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function KnowledgePage() {
  const { workspace, canEdit } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const isDesktop = useIsDesktop();
  const { data: graph, isLoading } = useKnowledgeGraph(workspace.id);
  const savePositions = useSaveNodePositions(workspace.id);
  const saveEdge = useSaveKnowledgeEdge(workspace.id);
  const saveNode = useSaveKnowledgeNode(workspace.id);
  const deleteNode = useDeleteKnowledgeNode(workspace.id);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<KnowledgeNodeType | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const matches = useCallback(
    (node: KnowledgeNode) => {
      if (typeFilter !== "all" && node.type !== typeFilter) return false;
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        node.title.toLowerCase().includes(term) ||
        node.summary.toLowerCase().includes(term)
      );
    },
    [search, typeFilter]
  );

  const flowNodes: Node[] = useMemo(() => {
    return (graph?.nodes ?? []).map((node, index) => ({
      id: node.id,
      type: "knowledge",
      position: positions[node.id] ?? {
        x: node.position?.x ?? (index % 5) * 220 - 440,
        y: node.position?.y ?? Math.floor(index / 5) * 120 - 200,
      },
      data: {
        label: node.title,
        nodeType: node.type,
        dimmed: Boolean((search.trim() || typeFilter !== "all") && !matches(node)),
      } satisfies GraphNodeData,
    }));
  }, [graph?.nodes, positions, matches, search, typeFilter]);

  const flowEdges: Edge[] = useMemo(() => {
    return (graph?.edges ?? []).map((edge) => ({
      id: edge.id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      label: edge.relation_type.replaceAll("_", " "),
      labelStyle: { fontSize: 9 },
      animated: edge.relation_type === "routes_to",
    }));
  }, [graph?.edges]);

  const selectedNode = graph?.nodes.find((n) => n.id === selectedId) ?? null;
  const selectedNeighbors = useMemo(() => {
    if (!graph || !selectedId) return [];
    return graph.edges
      .filter((e) => e.source_node_id === selectedId || e.target_node_id === selectedId)
      .map((e) => {
        const otherId = e.source_node_id === selectedId ? e.target_node_id : e.source_node_id;
        const other = graph.nodes.find((n) => n.id === otherId);
        return other
          ? { edge: e, node: other, direction: e.source_node_id === selectedId ? "out" : "in" }
          : null;
      })
      .filter(Boolean) as Array<{
      edge: (typeof graph.edges)[number];
      node: KnowledgeNode;
      direction: "in" | "out";
    }>;
  }, [graph, selectedId]);

  function entityLink(node: KnowledgeNode): string | null {
    if (!node.entity_id) return null;
    switch (node.type) {
      case "agent":
        return `${base}/agents/${node.entity_id}`;
      case "skill":
        return `${base}/skills/${node.entity_id}`;
      case "artifact":
        return `${base}/artifacts/${node.entity_id}`;
      case "routine":
        return `${base}/routines`;
      case "connection":
        return `${base}/connections`;
      default:
        return null;
    }
  }

  const onNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      setPositions((prev) => ({ ...prev, [node.id]: node.position }));
      savePositions.mutate([{ id: node.id, x: node.position.x, y: node.position.y }]);
    },
    [savePositions]
  );

  const onConnect = useCallback(
    (connection: FlowConnection) => {
      if (!connection.source || !connection.target) return;
      saveEdge.mutate(
        {
          source_node_id: connection.source,
          target_node_id: connection.target,
          relation_type: "related_to",
        },
        {
          onSuccess: () => toast.success("Relation added"),
          onError: (error) => toast.error("Could not add relation", { description: error.message }),
        }
      );
    },
    [saveEdge]
  );

  return (
    <div className="flex h-[calc(100svh-8.5rem)] min-h-96 flex-col gap-3">
      <PageHeader
        title="Knowledge graph"
        description="Your second brain: how projects, agents, skills, references, and artifacts relate. Router documents tell agents where to look."
        actions={
          canEdit && isDesktop ? (
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon /> Add node
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1 sm:max-w-xs">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="pl-8"
            aria-label="Search nodes"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as KnowledgeNodeType | "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {NODE_TYPES_LIST.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isDesktop ? (
          <Badge variant="muted">Read-only on mobile</Badge>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="min-h-0 flex-1 rounded-xl" />
      ) : !graph?.nodes.length ? (
        <EmptyState
          icon={NetworkIcon}
          title="The graph is empty"
          description="Add nodes for projects, references, and router documents — or seed the demo workspace to see a working example."
          action={
            canEdit ? (
              <Button onClick={() => setAddOpen(true)}>
                <PlusIcon /> Add node
              </Button>
            ) : null
          }
          className="flex-1"
        />
      ) : (
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border">
          {isDesktop ? (
            <ReactFlow
              nodes={flowNodes}
              edges={flowEdges}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedId(node.id)}
              onPaneClick={() => setSelectedId(null)}
              onNodeDragStop={canEdit ? onNodeDragStop : undefined}
              onConnect={canEdit ? onConnect : undefined}
              nodesDraggable={canEdit}
              nodesConnectable={canEdit}
              fitView
              proOptions={{ hideAttribution: true }}
              minZoom={0.2}
            >
              <Background gap={24} size={1} />
              <Controls showInteractive={false} />
              <MiniMap pannable zoomable className="!h-24 !w-36" />
            </ReactFlow>
          ) : (
            // Simplified mobile navigator: a grouped, tappable list.
            <div className="h-full overflow-y-auto p-3">
              <ul className="space-y-1.5">
                {(graph?.nodes ?? []).filter(matches).map((node) => {
                  const meta = NODE_META[node.type] ?? NODE_META.note;
                  const Icon = meta.icon;
                  return (
                    <li key={node.id}>
                      <button
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                          meta.className,
                          selectedId === node.id && "ring-ring ring-2"
                        )}
                        onClick={() => setSelectedId(node.id)}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{node.title}</span>
                        <Badge variant="muted" className="text-[10px]">
                          {node.type}
                        </Badge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {selectedNode ? (
            <aside
              className="bg-card/95 absolute inset-y-0 right-0 z-10 w-full max-w-sm overflow-y-auto border-l p-4 backdrop-blur sm:w-96"
              aria-label="Node details"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{selectedNode.title}</h2>
                  <Badge variant="muted" className="mt-1">
                    {selectedNode.type}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close details"
                  onClick={() => setSelectedId(null)}
                >
                  <XIcon />
                </Button>
              </div>
              {selectedNode.summary ? (
                <p className="text-muted-foreground mb-3 text-sm">{selectedNode.summary}</p>
              ) : null}
              {entityLink(selectedNode) ? (
                <Button asChild variant="outline" size="sm" className="mb-3">
                  <Link href={entityLink(selectedNode)!}>Open {selectedNode.type}</Link>
                </Button>
              ) : null}
              {selectedNode.source_url ? (
                <p className="mb-3 text-sm">
                  <a
                    href={selectedNode.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    Source link
                  </a>
                </p>
              ) : null}
              {selectedNode.content_markdown ? (
                <div className="bg-muted/40 mb-3 max-h-72 overflow-y-auto rounded-lg border p-3">
                  <Markdown>{selectedNode.content_markdown}</Markdown>
                </div>
              ) : null}
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Relations
                </p>
                {!selectedNeighbors.length ? (
                  <p className="text-muted-foreground text-sm">No relations.</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedNeighbors.map(({ edge, node, direction }) => (
                      <li key={edge.id}>
                        <button
                          className="hover:bg-accent/60 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                          onClick={() => setSelectedId(node.id)}
                        >
                          <span className="text-muted-foreground text-xs">
                            {direction === "out" ? "→" : "←"}{" "}
                            {edge.relation_type.replaceAll("_", " ")}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{node.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {canEdit && isDesktop ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive mt-4"
                  onClick={() =>
                    deleteNode.mutate(selectedNode.id, {
                      onSuccess: () => {
                        toast.success("Node deleted");
                        setSelectedId(null);
                      },
                      onError: (error) =>
                        toast.error("Delete failed", { description: error.message }),
                    })
                  }
                >
                  <Trash2Icon /> Delete node
                </Button>
              ) : null}
            </aside>
          ) : null}
        </div>
      )}

      <AddNodeDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(values) =>
          saveNode.mutate(
            { values: { ...values, position: { x: 0, y: 0 } } },
            {
              onSuccess: () => {
                toast.success("Node added");
                setAddOpen(false);
              },
              onError: (error) =>
                toast.error("Could not add node", { description: error.message }),
            }
          )
        }
      />
    </div>
  );
}

function AddNodeDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (values: Partial<KnowledgeNode>) => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KnowledgeNodeType>("note");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  // Reset fields each time the dialog opens (render-phase adjustment).
  const [prevOpen, setPrevOpen] = useState(false);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setTitle("");
      setType("note");
      setSummary("");
      setContent("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add knowledge node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="node-title">Title</Label>
              <Input
                id="node-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as KnowledgeNodeType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPES_LIST.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="node-summary">Summary</Label>
            <Input
              id="node-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          {(type === "router" || type === "note") && (
            <div className="space-y-2">
              <Label htmlFor="node-content">
                {type === "router" ? "Router document (markdown)" : "Content (markdown)"}
              </Label>
              <Textarea
                id="node-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-32 font-mono text-xs"
                placeholder={
                  type === "router"
                    ? "# Router\n\nPoint agents to the right projects, skills, references, and constraints."
                    : ""
                }
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!title.trim()) {
                toast.error("Node needs a title");
                return;
              }
              onAdd({
                title,
                type,
                summary,
                content_markdown: content || null,
              });
            }}
          >
            Add node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
