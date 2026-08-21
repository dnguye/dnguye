"use client";

import { createContext, useContext, useMemo } from "react";
import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useWorkspaces,
  type WorkspaceWithRole,
} from "@/lib/queries/use-workspaces";

interface WorkspaceContextValue {
  workspace: WorkspaceWithRole;
  workspaces: WorkspaceWithRole[];
  /** viewer=false; member/admin/owner=true */
  canEdit: boolean;
  canAdmin: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}

export function WorkspaceProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { data: workspaces, isLoading, isError } = useWorkspaces();

  const value = useMemo(() => {
    const workspace = workspaces?.find((w) => w.slug === slug);
    if (!workspace) return null;
    return {
      workspace,
      workspaces: workspaces ?? [],
      canEdit: ["owner", "admin", "member"].includes(workspace.role),
      canAdmin: ["owner", "admin"].includes(workspace.role),
    };
  }, [workspaces, slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh">
        <div className="hidden w-60 shrink-0 border-r p-4 md:block">
          <Skeleton className="mb-6 h-9 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !value) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <EmptyState
          icon={CompassIcon}
          title={isError ? "Couldn't load workspaces" : "Workspace not found"}
          description={
            isError
              ? "Check your connection and Supabase configuration, then try again."
              : "You don't have access to this workspace, or it doesn't exist."
          }
          action={
            <Button asChild variant="outline">
              <Link href="/">Go home</Link>
            </Button>
          }
          className="w-full max-w-md"
        />
      </main>
    );
  }

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
