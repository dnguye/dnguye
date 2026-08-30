"use client";

import { useState } from "react";

function pageList(current: number, total: number): (number | "…")[] {
  const pages = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
  const list: (number | "…")[] = [];
  let last = 0;
  for (const p of [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)) {
    // An ellipsis must hide at least two pages; render a lone gap page itself.
    if (p - last === 2) list.push(p - 1);
    else if (p - last > 2) list.push("…");
    list.push(p);
    last = p;
  }
  return list;
}

export function Pagination({ total = 12 }: { total?: number }) {
  const [page, setPage] = useState(5);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="rounded-md px-2.5 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        ← Prev
      </button>
      {pageList(page, total).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-neutral-400">
            …
          </span>
        ) : (
          <button
            key={p}
            aria-current={p === page ? "page" : undefined}
            onClick={() => setPage(p)}
            className={`size-8 rounded-md text-sm tabular-nums ${
              p === page
                ? "bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => setPage((p) => Math.min(total, p + 1))}
        disabled={page === total}
        className="rounded-md px-2.5 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Next →
      </button>
    </nav>
  );
}
