"use client";

import { useState } from "react";

export function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-8">
      <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors motion-reduce:transition-none ${
          checked ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-300 dark:bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none dark:bg-neutral-900 ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </label>
  );
}

export function SwitchDemo() {
  const [notify, setNotify] = useState(true);
  const [digest, setDigest] = useState(false);
  return (
    <div className="flex w-64 flex-col gap-4">
      <Switch label="Deploy notifications" checked={notify} onChange={setNotify} />
      <Switch label="Weekly digest" checked={digest} onChange={setDigest} />
    </div>
  );
}
