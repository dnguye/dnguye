import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { collections } from "@/atlas/collections";
import { getItems, itemCount, refId } from "@/atlas/registry";
import { site } from "@/atlas/site";

export default function ContentsPage() {
  const total = collections.reduce((sum, c) => sum + itemCount(c.id), 0);
  // "Recently added": the tail of each collection, newest-seeded last.
  const recent = collections
    .flatMap((c) => getItems(c.id).slice(-1))
    .slice(0, 4);

  return (
    <div className="flex flex-1 flex-col">
      {/* Masthead */}
      <div className="flex flex-col justify-between gap-10 border-b border-line px-6 pt-16 pb-14 sm:px-12 sm:pt-22 md:flex-row md:items-end">
        <div className="flex max-w-[720px] flex-col gap-5">
          <h1 className="font-serif text-[42px] leading-[1.08] font-normal tracking-[-0.01em] text-balance sm:text-[58px]">
            {site.tagline}
          </h1>
          <p className="max-w-[540px] text-base leading-relaxed text-muted">{site.description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 font-mono text-[11px] tracking-[0.06em] text-faint uppercase md:text-right">
          <div>{collections.length} collections</div>
          <div>{total} pieces</div>
          <div>0 dependencies</div>
        </div>
      </div>

      {/* Contents index */}
      <nav aria-label="Collections index" className="flex flex-col">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/${c.id}`}
            className="group flex flex-col gap-2 border-b border-line px-6 py-6 transition-colors hover:bg-surface sm:flex-row sm:items-center sm:gap-6 sm:px-12 sm:py-7"
          >
            <span className="hidden w-8 font-mono text-xs text-faint sm:inline">{c.index}</span>
            <span className="font-serif text-[26px] font-normal transition-colors group-hover:text-accent sm:w-[260px] sm:text-[28px]">
              {c.name}
            </span>
            <span className="flex-1 font-mono text-[11px] tracking-[0.04em] text-muted">
              {c.groups.join(" · ")}
            </span>
            <span className="hidden font-mono text-xs text-muted sm:inline">
              {itemCount(c.id)}
            </span>
            <ArrowRightIcon className="hidden size-4 text-faint transition-colors group-hover:text-accent sm:block" />
          </Link>
        ))}
      </nav>

      {/* Recently added */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-6 sm:px-12">
        <span className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
          Recently added
        </span>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
          {recent.map((item, i) => (
            <Link
              key={`${item.collection}/${item.slug}`}
              href={`/${item.collection}/${item.slug}`}
              className={i === 0 ? "text-accent hover:opacity-80" : "text-muted hover:text-accent"}
            >
              {item.name}
              <span className="ml-1.5 text-faint">{refId(item)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
