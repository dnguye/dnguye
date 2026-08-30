import Link from "next/link";

import type { Item } from "@/atlas/types";
import { cn } from "@/lib/cn";

/**
 * Collection-grid tile: the real Preview component rendered inline (cheap —
 * no iframe), full-bleed sections scaled down to read as thumbnails.
 * The link is an overlay, never a wrapper — demos may contain anchors, and
 * nesting <a> inside <a> is invalid HTML (and a hydration error).
 */
export function Tile({ item, refId }: { item: Item; refId: string }) {
  const fullBleed = item.stage?.fullBleed;
  const Visual = item.Thumb ?? item.Preview;
  return (
    <div className="group relative flex flex-col bg-canvas transition-colors hover:bg-surface">
      <Link
        href={`/${item.collection}/${item.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${item.name} (${refId})`}
      />
      <div
        className={cn(
          "pointer-events-none relative isolate h-[180px] overflow-hidden bg-surface",
          !fullBleed && "flex items-center justify-center p-6"
        )}
        style={{ containerType: "inline-size" }}
        aria-hidden="true"
        // Demos are interactive; inside a tile they are decoration only.
        inert
      >
        {fullBleed && !item.Thumb ? (
          <div className="absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25">
            <Visual />
          </div>
        ) : (
          <Visual />
        )}
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-[13px] font-medium transition-colors group-hover:text-accent">
          {item.name}
        </span>
        <span className="font-mono text-[10px] text-faint">{refId}</span>
      </div>
    </div>
  );
}
