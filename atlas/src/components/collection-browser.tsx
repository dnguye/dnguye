"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/cn";

type TileEntry = { key: string; tags: string[]; node: React.ReactNode };
type Group = { group: string; tiles: TileEntry[] };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/**
 * Grouped shelves with a sticky rail — the antidote to one endless feed.
 * Tiles arrive pre-rendered from the server; filtering only hides them.
 */
export function CollectionBrowser({ groups }: { groups: Group[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of groups)
      for (const t of g.tiles)
        for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [groups]);

  const visible = (t: TileEntry) => activeTag === null || t.tags.includes(activeTag);
  const shown = groups
    .map((g) => ({ ...g, tiles: g.tiles.filter(visible) }))
    .filter((g) => g.tiles.length > 0);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Rail */}
      <aside className="flex flex-col gap-7 border-b border-line py-7 lg:w-[240px] lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex flex-col">
          <div className="px-6 pb-3 font-mono text-[10px] tracking-[0.1em] text-faint uppercase sm:px-12 lg:pr-6">
            Groups
          </div>
          <nav aria-label="Groups" className="flex flex-row flex-wrap gap-x-1 px-6 sm:px-12 lg:flex-col lg:gap-0 lg:px-0">
            {groups.map((g) => {
              const count = g.tiles.filter(visible).length;
              return (
                <a
                  key={g.group}
                  href={`#${slugify(g.group)}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[13px] transition-colors lg:rounded-none lg:border-l-2 lg:border-transparent lg:px-12 lg:hover:border-line-strong",
                    count === 0 ? "text-faint" : "text-muted hover:text-ink"
                  )}
                >
                  <span>{g.group}</span>
                  <span className="hidden font-mono text-[11px] text-faint lg:inline">
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-2.5 px-6 sm:px-12 lg:pr-6">
          <div className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">Filter</div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(([tag]) => (
              <button
                key={tag}
                type="button"
                aria-pressed={activeTag === tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[10px] transition-colors",
                  activeTag === tag
                    ? "border-accent text-accent"
                    : "border-line-strong text-muted hover:text-ink"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Shelves */}
      <div className="flex flex-1 flex-col pb-10">
        {shown.map((g) => (
          <section key={g.group} aria-label={g.group} className="flex flex-col">
            <div
              id={slugify(g.group)}
              className="flex scroll-mt-20 items-baseline gap-3 px-6 pt-7 pb-4 sm:px-10"
            >
              <h2 className="font-serif text-xl font-normal">{g.group}</h2>
              <span className="font-mono text-[11px] text-faint">
                {String(g.tiles.length).padStart(2, "0")}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-px border-y border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
              {g.tiles.map((t) => (
                <div key={t.key} className="bg-canvas">
                  {t.node}
                </div>
              ))}
              {/* Fill the last row so hairlines stay ruled */}
              {Array.from({ length: (3 - (g.tiles.length % 3)) % 3 }).map((_, i) => (
                <div key={`pad-${i}`} className="hidden bg-canvas xl:block" />
              ))}
            </div>
          </section>
        ))}
        {shown.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted sm:px-10">
            Nothing carries that tag.
          </div>
        ) : null}
      </div>
    </div>
  );
}
