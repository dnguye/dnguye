import Link from "next/link";

import type { Item } from "@/atlas/types";
import { TileStage } from "./tile-stage";

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
      <TileStage className={fullBleed && !item.Thumb ? undefined : "flex items-center justify-center p-6"}>
        {fullBleed && !item.Thumb ? (
          <div className="absolute top-0 left-0 h-[400%] w-[400%] origin-top-left scale-25">
            <Visual />
          </div>
        ) : (
          <Visual />
        )}
      </TileStage>
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-[13px] font-medium transition-colors group-hover:text-accent">
          {item.name}
        </span>
        <span className="font-mono text-[10px] text-faint">{refId}</span>
      </div>
    </div>
  );
}
