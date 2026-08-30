"use client";

import { useMemo, useState } from "react";

const ROWS = [
  { service: "api-gateway", region: "us-east", p99: 182, errors: 0.02 },
  { service: "billing", region: "eu-central", p99: 341, errors: 0.11 },
  { service: "search", region: "us-east", p99: 96, errors: 0.01 },
  { service: "ingest", region: "ap-southeast", p99: 428, errors: 0.34 },
  { service: "auth", region: "us-west", p99: 74, errors: 0.0 },
];

type Key = keyof (typeof ROWS)[number];

export function DataTable() {
  const [sortKey, setSortKey] = useState<Key>("p99");
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(
    () =>
      [...ROWS].sort((a, b) => {
        const cmp = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
        return asc ? cmp : -cmp;
      }),
    [sortKey, asc]
  );

  function header(key: Key, label: string, numeric = false) {
    const active = sortKey === key;
    return (
      <th
        scope="col"
        aria-sort={active ? (asc ? "ascending" : "descending") : "none"}
        className={numeric ? "text-right" : "text-left"}
      >
        <button
          onClick={() => (active ? setAsc(!asc) : (setSortKey(key), setAsc(false)))}
          className={`px-3 py-2 font-mono text-[10px] tracking-widest uppercase ${
            active ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          {label}
          {active ? (asc ? " ↑" : " ↓") : ""}
        </button>
      </th>
    );
  }

  return (
    <div className="w-full max-w-lg overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full border-collapse text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <tr>
            {header("service", "Service")}
            {header("region", "Region")}
            {header("p99", "p99 ms", true)}
            {header("errors", "Err %", true)}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {sorted.map((row) => (
            <tr key={row.service} className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900">
              <td className="px-3 py-2 font-mono text-xs text-neutral-900 dark:text-neutral-100">
                {row.service}
              </td>
              <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{row.region}</td>
              <td className={`px-3 py-2 text-right tabular-nums ${row.p99 > 300 ? "text-amber-700 dark:text-amber-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                {row.p99}
              </td>
              <td className={`px-3 py-2 text-right tabular-nums ${row.errors > 0.2 ? "text-red-700 dark:text-red-400" : "text-neutral-700 dark:text-neutral-300"}`}>
                {row.errors.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
