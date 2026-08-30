import { collections, refPrefix } from "./collections";
import type { CollectionId, Item, SearchEntry } from "./types";

import { items as motion } from "./items/motion";
import { items as foundations } from "./items/foundations";
import { items as ui } from "./items/ui";
import { items as sections } from "./items/sections";

const byCollection: Record<CollectionId, Item[]> = {
  motion,
  foundations,
  ui,
  sections,
};

export function getItems(collection: CollectionId): Item[] {
  return byCollection[collection];
}

export function getItem(collection: CollectionId, slug: string): Item | undefined {
  return byCollection[collection]?.find((i) => i.slug === slug);
}

/** "M-01" style reference id, stable by position within the collection. */
export function refId(item: Item): string {
  const list = byCollection[item.collection];
  const n = list.indexOf(item) + 1;
  return `${refPrefix[item.collection]}-${String(n).padStart(2, "0")}`;
}

export function itemCount(collection: CollectionId): number {
  return byCollection[collection].length;
}

export function groupedItems(collection: CollectionId): { group: string; items: Item[] }[] {
  const meta = collections.find((c) => c.id === collection);
  const list = byCollection[collection];
  const groups = meta?.groups ?? [...new Set(list.map((i) => i.group))];
  return groups
    .map((group) => ({ group, items: list.filter((i) => i.group === group) }))
    .filter((g) => g.items.length > 0);
}

/** Prev/next within the whole collection, in registry order. */
export function neighbors(item: Item): { prev?: Item; next?: Item } {
  const list = byCollection[item.collection];
  const i = list.indexOf(item);
  return { prev: list[i - 1], next: list[i + 1] };
}

export function searchIndex(): SearchEntry[] {
  return collections.flatMap((c) =>
    byCollection[c.id].map((item) => ({
      collection: c.id,
      collectionName: c.name,
      slug: item.slug,
      name: item.name,
      group: item.group,
      summary: item.summary,
      tags: item.tags,
      ref: refId(item),
    }))
  );
}
