"use client";

import { useId, useState } from "react";

const TABS = [
  { label: "Overview", body: "High-level metrics and the latest activity, in one glance." },
  { label: "Members", body: "Who has access, their roles, and pending invitations." },
  { label: "Billing", body: "Plan, payment method, and the invoice history." },
];

export function Tabs() {
  const [active, setActive] = useState(0);
  const id = useId();

  return (
    <div className="w-full max-w-md">
      <div role="tablist" aria-label="Workspace sections" className="flex border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setActive((a) => (a + 1) % TABS.length);
              if (e.key === "ArrowLeft") setActive((a) => (a - 1 + TABS.length) % TABS.length);
            }}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
              i === active
                ? "border-neutral-900 font-medium text-neutral-900 dark:border-neutral-100 dark:text-neutral-100"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab, i) => (
        <div
          key={tab.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="py-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
        >
          {tab.body}
        </div>
      ))}
    </div>
  );
}
