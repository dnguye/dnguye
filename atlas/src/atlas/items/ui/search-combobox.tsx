"use client";

import { useMemo, useRef, useState } from "react";

const PEOPLE = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Margaret Hamilton", "Annie Easley", "Mary Jackson"];

export function SearchCombobox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => PEOPLE.filter((p) => p.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  function choose(person: string) {
    setChosen(person);
    setQuery(person);
    setOpen(false);
  }

  return (
    <div className="relative w-72">
      <label htmlFor="assignee" className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        Assignee
      </label>
      <input
        ref={inputRef}
        id="assignee"
        role="combobox"
        aria-expanded={open}
        aria-controls="assignee-list"
        aria-activedescendant={open ? `option-${cursor}` : undefined}
        value={query}
        placeholder="Search people…"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setCursor(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
          if (e.key === "Enter" && results[cursor]) choose(results[cursor]);
          if (e.key === "Escape") setOpen(false);
        }}
        className="mt-1.5 h-9 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      {open && results.length > 0 ? (
        <ul
          id="assignee-list"
          role="listbox"
          className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          {results.map((person, i) => (
            <li
              key={person}
              id={`option-${i}`}
              role="option"
              aria-selected={person === chosen}
              onMouseDown={() => choose(person)}
              onMouseMove={() => setCursor(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === cursor
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {person}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
