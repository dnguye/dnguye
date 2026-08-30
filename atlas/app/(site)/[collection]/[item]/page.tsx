import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { collectionIds, getCollection } from "@/atlas/collections";
import { buildHandoff } from "@/atlas/handoff";
import { getItem, getItems, neighbors, refId } from "@/atlas/registry";
import { getSource } from "@/atlas/sources.server";
import type { CollectionId } from "@/atlas/types";
import { CodeBox, type CodeFile } from "@/components/code-box";
import { HandoffBox } from "@/components/handoff-box";
import { Stage } from "@/components/stage";
import { highlight } from "@/lib/shiki";

export function generateStaticParams() {
  return collectionIds.flatMap((collection) =>
    getItems(collection).map((item) => ({ collection, item: item.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[collection]/[item]">): Promise<Metadata> {
  const { collection, item: slug } = await params;
  const item = getItem(collection as CollectionId, slug);
  return item ? { title: item.name, description: item.summary } : {};
}

export default async function ItemPage({ params }: PageProps<"/[collection]/[item]">) {
  const { collection, item: slug } = await params;
  const meta = getCollection(collection);
  const item = getItem(collection as CollectionId, slug);
  if (!meta || !item) notFound();

  const sources = Object.fromEntries(item.files.map((f) => [f.source, getSource(f.source)]));
  const codeFiles: CodeFile[] = await Promise.all(
    item.files.map(async (f) => ({
      path: f.path,
      raw: sources[f.source],
      html: await highlight(sources[f.source], f.lang),
      lines: sources[f.source].trimEnd().split("\n").length,
    }))
  );
  const handoff = buildHandoff(item, sources);
  const { prev, next } = neighbors(item);
  const deps = item.deps ?? [];

  return (
    <div className="flex flex-1 flex-col">
      {/* Masthead */}
      <div className="flex flex-col justify-between gap-6 border-b border-line px-6 pt-9 pb-7 sm:px-12 md:flex-row md:items-end">
        <div className="flex max-w-[640px] flex-col gap-3">
          <nav aria-label="Breadcrumb" className="flex gap-2 font-mono text-[11px] text-faint">
            <Link href={`/${meta.id}`} className="text-muted hover:text-accent">
              {meta.name}
            </Link>
            <span>/</span>
            <span className="text-muted">{item.group}</span>
            <span>/</span>
            <span className="text-accent">{refId(item)}</span>
          </nav>
          <h1 className="font-serif text-[32px] leading-tight font-normal sm:text-[38px]">
            {item.name}
          </h1>
          <p className="text-sm leading-relaxed text-muted">{item.summary}</p>
          <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line-strong px-2.5 py-1 text-muted">
                {tag}
              </span>
            ))}
            <span className="rounded-full border border-line px-2.5 py-1 text-faint">
              deps: {deps.length > 0 ? deps.join(", ") : "none"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 font-mono text-[11px]">
          {prev ? (
            <Link
              href={`/${prev.collection}/${prev.slug}`}
              className="flex items-center gap-1.5 text-muted hover:text-accent"
            >
              <ArrowLeftIcon className="size-3.5" /> Prev
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/${next.collection}/${next.slug}`}
              className="flex items-center gap-1.5 hover:text-accent"
            >
              Next <ArrowRightIcon className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {/* Stage */}
      <Stage previewPath={`/preview/${item.collection}/${item.slug}/`} height={item.stage?.height} />

      {/* Code + hand-off */}
      <div className="grid grid-cols-1 gap-8 px-6 py-8 sm:px-12 xl:grid-cols-2">
        <CodeBox files={codeFiles} />
        <div className="flex flex-col gap-6">
          <HandoffBox text={handoff} />
          {item.notes?.integration || item.notes?.a11y ? (
            <div className="flex flex-col gap-4 rounded-lg border border-line px-5 py-4">
              {item.notes.integration ? (
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                    Integration
                  </div>
                  <ol className="list-decimal space-y-1 pl-4 text-[13px] leading-relaxed text-muted">
                    {item.notes.integration.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              {item.notes.a11y ? (
                <div className="flex flex-col gap-1.5">
                  <div className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                    Accessibility
                  </div>
                  <ul className="list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-muted">
                    {item.notes.a11y.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
