import { notFound } from "next/navigation";

import { collectionIds } from "@/atlas/collections";
import { getItem, getItems } from "@/atlas/registry";
import type { CollectionId } from "@/atlas/types";
import { PreviewShell } from "@/components/preview-shell";

export function generateStaticParams() {
  return collectionIds.flatMap((collection) =>
    getItems(collection).map((item) => ({ collection, item: item.slug }))
  );
}

export const dynamicParams = false;

export default async function PreviewPage({
  params,
}: PageProps<"/preview/[collection]/[item]">) {
  const { collection, item: slug } = await params;
  const item = getItem(collection as CollectionId, slug);
  if (!item) notFound();

  return (
    <PreviewShell fullBleed={item.stage?.fullBleed}>
      <item.Preview />
    </PreviewShell>
  );
}
