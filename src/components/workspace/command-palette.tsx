"use client";

import { useRouter } from "next/navigation";
import {
  BotIcon,
  CalendarClockIcon,
  FileBoxIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MoonIcon,
  NetworkIcon,
  PlayIcon,
  PlugIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  WrenchIcon,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAgents } from "@/lib/queries/use-agents";
import { useSkills } from "@/lib/queries/use-skills";
import { useWorkspace } from "./workspace-provider";

export function CommandPalette({
  open,
  onOpenChange,
  onQuickRun,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickRun: (skillId?: string | null) => void;
}) {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const { resolvedTheme, setTheme } = useTheme();
  const { data: skills } = useSkills(workspace.id);
  const { data: agents } = useAgents(workspace.id);

  const base = `/w/${workspace.slug}`;

  function go(path: string) {
    onOpenChange(false);
    router.push(path);
  }

  const pages = [
    { label: "Dashboard", path: `${base}/dashboard`, icon: LayoutDashboardIcon },
    { label: "Agents", path: `${base}/agents`, icon: BotIcon },
    { label: "Skills", path: `${base}/skills`, icon: SparklesIcon },
    { label: "Routines", path: `${base}/routines`, icon: CalendarClockIcon },
    { label: "Runs", path: `${base}/runs`, icon: ListChecksIcon },
    { label: "Approvals", path: `${base}/approvals`, icon: ShieldCheckIcon },
    { label: "Artifacts", path: `${base}/artifacts`, icon: FileBoxIcon },
    { label: "Knowledge graph", path: `${base}/knowledge`, icon: NetworkIcon },
    { label: "Connections", path: `${base}/connections`, icon: PlugIcon },
    { label: "Settings", path: `${base}/settings`, icon: WrenchIcon },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, skills, agents, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              onQuickRun(null);
            }}
          >
            <PlayIcon /> Quick run…
            <CommandShortcut>⇧R</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme(resolvedTheme === "dark" ? "light" : "dark");
            }}
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            Toggle theme
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {pages.map((page) => (
            <CommandItem key={page.path} onSelect={() => go(page.path)}>
              <page.icon /> {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {skills?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Run a skill">
              {skills
                .filter((s) => s.is_active)
                .map((skill) => (
                  <CommandItem
                    key={skill.id}
                    value={`run ${skill.name}`}
                    onSelect={() => {
                      onOpenChange(false);
                      onQuickRun(skill.id);
                    }}
                  >
                    <PlayIcon /> Run: {skill.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        ) : null}
        {agents?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Agents">
              {agents.map((agent) => (
                <CommandItem
                  key={agent.id}
                  value={`agent ${agent.name}`}
                  onSelect={() => go(`${base}/agents/${agent.id}`)}
                >
                  <BotIcon /> {agent.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
