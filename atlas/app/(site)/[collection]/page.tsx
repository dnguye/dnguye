import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { collectionIds, getCollection } from "@/atlas/collections";
import { groupedItems, itemCount, refId } from "@/atlas/registry";
import type { CollectionId } from "@/atlas/types";
import { CollectionBrowser } from "@/components/collection-browser";
import { Tile } from "@/components/tile";

export function generateStaticParams() {
  return collectionIds.map((collection) => ({ collection }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[collection]">): Promise<Metadata> {
  const { collection } = await params;
  const meta = getCollection(collection);
  return meta ? { title: meta.name, description: meta.tagline } : {};
}

export default async function CollectionPage({ params }: PageProps<"/[collection]">) {
  const { collection } = await params;
  const meta = getCollection(collection);
  if (!meta) notFound();

  const groups = groupedItems(meta.id as CollectionId).map((g) => ({
    group: g.group,
    tiles: g.items.map((item) => ({
      key: item.slug,
      tags: item.tags,
      node: <Tile key={item.slug} item={item} refId={refId(item)} />,
    })),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-2 border-b border-line px-6 pt-10 pb-7 sm:flex-row sm:items-baseline sm:gap-5 sm:px-12">
        <span className="font-mono text-[13px] text-faint">{meta.index}</span>
        <h1 className="font-serif text-[34px] font-normal sm:text-[40px]">{meta.name}</h1>
        <p className="text-sm text-muted">{meta.tagline}</p>
        <span className="font-mono text-xs tracking-[0.06em] text-muted uppercase sm:ml-auto">
          {itemCount(meta.id as CollectionId)} pieces
        </span>
      </div>
      <CollectionBrowser groups={groups} />
    </div>
  );
}
