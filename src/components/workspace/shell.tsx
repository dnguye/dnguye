"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BotIcon,
  CalendarClockIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FileBoxIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  LogOutIcon,
  MenuIcon,
  NetworkIcon,
  PlayIcon,
  PlugIcon,
  PlusIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRuns, useRunsRealtime } from "@/lib/queries/use-runs";
import { cn, initials } from "@/lib/utils";
import { CommandCenterContext } from "./command-center-context";
import { CommandPalette } from "./command-palette";
import { QuickRunDialog } from "./quick-run-dialog";
import { ThemeToggle } from "./theme-toggle";
import { useWorkspace } from "./workspace-provider";

const NAV = [
  { label: "Dashboard", segment: "dashboard", icon: LayoutDashboardIcon },
  { label: "Agents", segment: "agents", icon: BotIcon },
  { label: "Skills", segment: "skills", icon: SparklesIcon },
  { label: "Routines", segment: "routines", icon: CalendarClockIcon },
  { label: "Runs", segment: "runs", icon: ListChecksIcon },
  { label: "Approvals", segment: "approvals", icon: ShieldCheckIcon },
  { label: "Artifacts", segment: "artifacts", icon: FileBoxIcon },
  { label: "Knowledge", segment: "knowledge", icon: NetworkIcon },
  { label: "Connections", segment: "connections", icon: PlugIcon },
  { label: "Settings", segment: "settings", icon: WrenchIcon },
];

function NavLinks({
  base,
  pathname,
  approvalsCount,
  onNavigate,
}: {
  base: string;
  pathname: string;
  approvalsCount: number;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Workspace">
      {NAV.map((item) => {
        const href = `${base}/${item.segment}`;
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={item.segment}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.segment === "approvals" && approvalsCount > 0 ? (
              <Badge variant="warning" className="px-1.5 text-[10px]">
                {approvalsCount}
              </Badge>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspace, workspaces } = useWorkspace();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 px-2 py-1.5"
        >
          <div className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold">
            {initials(workspace.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-left text-sm font-medium">
              {workspace.name}
            </span>
            <span className="text-muted-foreground text-[11px] capitalize">
              {workspace.role}
            </span>
          </div>
          <ChevronsUpDownIcon className="text-muted-foreground size-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onSelect={() => router.push(`/w/${ws.slug}/dashboard`)}
          >
            <div className="bg-muted flex size-5 items-center justify-center rounded text-[10px] font-semibold">
              {initials(ws.name)}
            </div>
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.id === workspace.id ? <CheckIcon className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/onboarding")}>
          <PlusIcon /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          <Avatar className="size-6">
            <AvatarFallback>{email ? initials(email) : "…"}</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-left text-xs">
            {email || "Account"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} variant="destructive">
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { workspace } = useWorkspace();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [quickRunOpen, setQuickRunOpen] = useState(false);
  const [quickRunSkillId, setQuickRunSkillId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const base = `/w/${workspace.slug}`;

  useRunsRealtime(workspace.id);
  const { data: pendingApprovals } = useRuns(workspace.id, {
    status: "needs_approval",
    limit: 20,
  });
  const approvalsCount = pendingApprovals?.length ?? 0;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commandCenter = useMemo(
    () => ({
      openPalette: () => setPaletteOpen(true),
      openQuickRun: (skillId?: string | null) => {
        setQuickRunSkillId(skillId ?? null);
        setQuickRunOpen(true);
      },
    }),
    []
  );

  return (
    <CommandCenterContext.Provider value={commandCenter}>
      <div className="flex min-h-svh">
        {/* Desktop sidebar */}
        <aside className="bg-sidebar border-sidebar-border sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r md:flex">
          <div className="p-3">
            <WorkspaceSwitcher />
          </div>
          <div className="flex-1 overflow-y-auto px-3">
            <NavLinks base={base} pathname={pathname} approvalsCount={approvalsCount} />
          </div>
          <div className="border-sidebar-border space-y-1 border-t p-3">
            <UserMenu />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
            {/* Mobile nav */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open navigation">
                  <MenuIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="p-3 pt-4">
                  <WorkspaceSwitcher />
                </div>
                <div className="flex-1 overflow-y-auto px-3">
                  <NavLinks
                    base={base}
                    pathname={pathname}
                    approvalsCount={approvalsCount}
                    onNavigate={() => setMobileNavOpen(false)}
                  />
                </div>
                <div className="border-t p-3">
                  <UserMenu />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              className="text-muted-foreground h-8 w-full max-w-xs justify-start gap-2 text-xs font-normal sm:w-64"
              onClick={() => setPaletteOpen(true)}
            >
              <SearchIcon className="size-3.5" />
              Search or jump to…
              <kbd className="bg-muted pointer-events-none ml-auto hidden rounded px-1.5 py-0.5 font-mono text-[10px] sm:inline-block">
                ⌘K
              </kbd>
            </Button>

            <div className="ml-auto flex items-center gap-1.5">
              <ThemeToggle />
              <Button size="sm" onClick={() => commandCenter.openQuickRun(null)}>
                <PlayIcon /> <span className="hidden sm:inline">Quick run</span>
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onQuickRun={commandCenter.openQuickRun}
      />
      <QuickRunDialog
        open={quickRunOpen}
        onOpenChange={setQuickRunOpen}
        initialSkillId={quickRunSkillId}
      />
    </CommandCenterContext.Provider>
  );
}
