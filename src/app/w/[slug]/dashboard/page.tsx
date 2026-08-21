"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { RotateCcwIcon } from "lucide-react";
import { toast } from "sonner";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetFrame } from "@/components/dashboard/widget-frame";
import { WIDGETS } from "@/components/dashboard/widgets";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  useDashboardLayout,
  useSaveDashboardLayout,
} from "@/lib/queries/use-dashboard-layout";
import type { DashboardLayoutItem } from "@/lib/types";

// react-grid-layout touches `window` at import time in places; load client-only.
const GridLayout = dynamic(
  async () => {
    const mod = await import("react-grid-layout");
    // CJS interop: the class may live on `default` or be the module itself.
    const RGL = (mod.default ??
      (mod as unknown)) as React.ComponentType<import("react-grid-layout").ReactGridLayoutProps>;
    return mod.WidthProvider(
      RGL as unknown as React.ComponentClass<import("react-grid-layout").ReactGridLayoutProps>
    );
  },
  { ssr: false, loading: () => <DashboardSkeleton /> }
);

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-xl" />
      ))}
    </div>
  );
}

const DEFAULT_LAYOUT: DashboardLayoutItem[] = WIDGETS.map((w) => ({
  i: w.id,
  ...w.default,
}));

/** Widget priority for the mobile vertical feed. */
const MOBILE_ORDER = [
  "attention",
  "routines",
  "skills",
  "agents",
  "artifacts",
  "connections",
  "activity",
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

export default function DashboardPage() {
  const { workspace } = useWorkspace();
  const base = `/w/${workspace.slug}`;
  const isDesktop = useIsDesktop();
  const { data: savedLayout, isLoading } = useDashboardLayout(workspace.id);
  const saveLayout = useSaveDashboardLayout(workspace.id);
  // Local edits win; otherwise derive from the saved layout (or the default).
  const [localLayout, setLocalLayout] = useState<DashboardLayoutItem[] | null>(null);
  const layout =
    localLayout ?? (isLoading ? null : savedLayout?.length ? savedLayout : DEFAULT_LAYOUT);

  const persist = useCallback(
    (next: ReadonlyArray<{ i: string; x: number; y: number; w: number; h: number }>) => {
      const items = next.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }));
      setLocalLayout(items);
      saveLayout.mutate(items, {
        onError: () => toast.error("Couldn't save your layout"),
      });
    },
    [saveLayout]
  );

  const gridChildren = useMemo(
    () =>
      WIDGETS.map((widget) => (
        <div key={widget.id}>
          <WidgetFrame
            title={widget.title}
            icon={widget.icon}
            href={widget.href?.(base)}
          >
            <widget.component />
          </WidgetFrame>
        </div>
      )),
    [base]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        description="Your command center. Drag to rearrange, grab a corner to resize — the layout is saved per workspace."
        actions={
          isDesktop ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => persist(DEFAULT_LAYOUT)}
            >
              <RotateCcwIcon /> Reset layout
            </Button>
          ) : null
        }
      />

      {isDesktop === null || layout === null ? (
        <DashboardSkeleton />
      ) : isDesktop ? (
        <GridLayout
          className="-mx-2"
          layout={layout.map((item) => {
            const def = WIDGETS.find((w) => w.id === item.i);
            return { ...item, minW: def?.minW ?? 2, minH: def?.minH ?? 2 };
          })}
          cols={12}
          rowHeight={56}
          margin={[16, 16]}
          draggableHandle=".widget-drag-handle"
          onDragStop={(next: import("react-grid-layout").Layout[]) => persist(next)}
          onResizeStop={(next: import("react-grid-layout").Layout[]) => persist(next)}
        >
          {gridChildren}
        </GridLayout>
      ) : (
        // Mobile: prioritized vertical feed instead of a draggable grid.
        <div className="space-y-4">
          {MOBILE_ORDER.map((id) => {
            const widget = WIDGETS.find((w) => w.id === id);
            if (!widget) return null;
            return (
              <div key={id} className="max-h-96 min-h-40">
                <WidgetFrame
                  title={widget.title}
                  icon={widget.icon}
                  href={widget.href?.(base)}
                  draggable={false}
                >
                  <widget.component />
                </WidgetFrame>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
