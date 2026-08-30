"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import type { SearchEntry } from "@/atlas/types";
import { cn } from "@/lib/cn";

function matches(entry: SearchEntry, q: string): boolean {
  const hay = `${entry.name} ${entry.group} ${entry.collectionName} ${entry.summary} ${entry.tags.join(" ")} ${entry.ref}`.toLowerCase();
  return q.split(/\s+/).every((part) => hay.includes(part));
}

export function CommandPalette({
  index,
  open,
  onOpenChange,
}: {
  index: SearchEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = q ? index.filter((e) => matches(e, q)) : index;
    return found.slice(0, 12);
  }, [index, query]);

  const groups = useMemo(() => {
    const byCollection = new Map<string, SearchEntry[]>();
    for (const entry of results) {
      const list = byCollection.get(entry.collectionName) ?? [];
      list.push(entry);
      byCollection.set(entry.collectionName, list);
    }
    return [...byCollection.entries()];
  }, [results]);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        setQuery("");
        setCursor(0);
      }
      onOpenChange(next);
    },
    [onOpenChange]
  );

  const openEntry = useCallback(
    (entry: SearchEntry) => {
      setOpen(false);
      router.push(`/${entry.collection}/${entry.slug}`);
    },
    [setOpen, router]
  );

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the library"
        className="mx-auto mt-[12vh] w-[min(640px,calc(100vw-32px))] overflow-hidden rounded-xl border border-line-strong bg-surface shadow-[0_32px_80px_rgba(0,0,0,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <SearchIcon className="size-4 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (e.key === "Enter" && results[cursor]) {
                openEntry(results[cursor]);
              }
            }}
            placeholder="Search the library…"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted">
              Nothing matches “{query}”.
            </div>
          ) : (
            groups.map(([collectionName, entries]) => (
              <div key={collectionName}>
                <div className="px-5 pt-2.5 pb-1.5 font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                  {collectionName}
                </div>
                {entries.map((entry) => {
                  const i = results.indexOf(entry);
                  return (
                    <button
                      key={`${entry.collection}/${entry.slug}`}
                      type="button"
                      data-index={i}
                      onClick={() => openEntry(entry)}
                      onMouseMove={() => setCursor(i)}
                      className={cn(
                        "flex w-full items-center gap-3 border-l-2 px-5 py-2.5 text-left",
                        i === cursor
                          ? "border-accent bg-raised"
                          : "border-transparent"
                      )}
                    >
                      <span className="text-sm">{entry.name}</span>
                      <span className="font-mono text-[10px] text-faint">{entry.group}</span>
                      <span className="ml-auto font-mono text-[10px] text-faint">{entry.ref}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center gap-4 border-t border-line bg-canvas px-5 py-2.5 font-mono text-[10px] text-faint">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span className="ml-auto">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
