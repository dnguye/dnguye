"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { site } from "@/atlas/site";
import { collections } from "@/atlas/collections";
import type { SearchEntry } from "@/atlas/types";
import { cn } from "@/lib/cn";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

export function Header({ index }: { index: SearchEntry[] }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-canvas/95 px-6 backdrop-blur-sm sm:px-12">
      <Link href="/" className="flex items-baseline gap-3.5">
        <span className="font-serif text-[22px] font-medium tracking-[0.02em]">{site.name}</span>
        <span className="hidden font-mono text-[11px] tracking-[0.08em] text-muted uppercase sm:inline">
          {site.kicker}
        </span>
      </Link>
      <div className="flex items-center gap-4 sm:gap-7">
        <nav aria-label="Collections" className="hidden items-center gap-6 font-mono text-xs md:flex">
          {collections.map((c) => {
            const active = pathname === `/${c.id}` || pathname.startsWith(`/${c.id}/`);
            return (
              <Link
                key={c.id}
                href={`/${c.id}`}
                className={cn(
                  "tracking-[0.04em] transition-colors hover:text-accent",
                  active ? "text-accent" : "text-ink"
                )}
              >
                {c.name}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          <SearchIcon className="size-3.5" />
          <span className="hidden text-xs sm:inline">Search</span>
          <kbd className="hidden rounded-sm border border-line-strong px-1.5 py-px font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
        <ThemeToggle />
      </div>
      <CommandPalette index={index} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
