"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, SearchIcon, XIcon } from "lucide-react";

import { site } from "@/atlas/site";
import { collections } from "@/atlas/collections";
import type { SearchEntry } from "@/atlas/types";
import { cn } from "@/lib/cn";
import { CommandPalette } from "./command-palette";
import { ThemeToggle } from "./theme-toggle";

export function Header({ index }: { index: SearchEntry[] }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Escape and taps outside the header close the menu; each link closes it
  // itself on navigation.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!headerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (id: string) => pathname === `/${id}` || pathname.startsWith(`/${id}/`);
  const count = (id: string) => index.filter((entry) => entry.collection === id).length;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-sm"
    >
      <div className="flex h-16 items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={menuOpen ? "Close library menu" : "Open library menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="text-muted hover:text-ink -ml-1 flex size-8 items-center justify-center rounded-md md:hidden"
          >
            {menuOpen ? <XIcon className="size-4.5" /> : <MenuIcon className="size-4.5" />}
          </button>
          <Link href="/" className="flex items-baseline gap-3.5">
            <span className="font-serif text-[22px] font-medium tracking-[0.02em]">{site.name}</span>
            <span className="hidden font-mono text-[11px] tracking-[0.08em] text-muted uppercase lg:inline">
              {site.kicker}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4 sm:gap-7">
          <nav aria-label="Collections" className="hidden items-center gap-6 font-mono text-xs md:flex">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/${c.id}`}
                className={cn(
                  "tracking-[0.04em] transition-colors hover:text-accent",
                  isActive(c.id) ? "text-accent" : "text-ink"
                )}
              >
                {c.name}
              </Link>
            ))}
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
      </div>

      {/* Library menu (small screens): jump between collections directly. */}
      {menuOpen ? (
        <nav
          aria-label="Library menu"
          className="absolute inset-x-0 top-full border-b border-line bg-canvas shadow-[0_16px_40px_rgba(0,0,0,0.25)] md:hidden"
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex items-center gap-4 border-b border-line px-6 py-3.5",
              pathname === "/" ? "text-accent" : "text-muted"
            )}
          >
            <span className="w-6 font-mono text-[11px] text-faint">00</span>
            <span className="font-serif text-lg">Contents</span>
          </Link>
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/${c.id}`}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-4 border-b border-line px-6 py-3.5 last:border-b-0",
                isActive(c.id) ? "text-accent" : "text-ink"
              )}
            >
              <span className="w-6 font-mono text-[11px] text-faint">{c.index}</span>
              <span className="font-serif text-lg">{c.name}</span>
              <span className="ml-auto font-mono text-[11px] text-faint">{count(c.id)}</span>
            </Link>
          ))}
        </nav>
      ) : null}
      <CommandPalette index={index} open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
