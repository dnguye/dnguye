"use client";

import { useState } from "react";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-lg border border-neutral-300 bg-neutral-100 p-0.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          aria-pressed={opt === value}
          onClick={() => onChange(opt)}
          className={`rounded-[7px] px-3.5 py-1.5 text-sm transition-colors ${
            opt === value
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SegmentedControlDemo() {
  const [period, setPeriod] = useState("Month");
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl
        label="Billing period"
        options={["Day", "Week", "Month", "Year"]}
        value={period}
        onChange={setPeriod}
      />
      <p className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        showing: {period.toLowerCase()}
      </p>
    </div>
  );
}
