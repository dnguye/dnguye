"use client";

import { useEffect, useRef, useState } from "react";

const ITEMS = ["Rename", "Duplicate", "Move to…", "Archive"];

export function DropdownMenu() {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving focus: DOM focus moves into the menu, so assistive tech announces
  // each item as the arrows travel.
  useEffect(() => {
    if (open) itemRefs.current[cursor]?.focus();
  }, [open, cursor]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu() {
    setCursor(0);
    setOpen(true);
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function choose(item: string) {
    setChosen(item);
    close(true);
  }

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col items-center gap-3"
      onBlur={(e) => {
        // Focus left the widget entirely (e.g. Tab) — close without stealing it back.
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close(true) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openMenu();
          }
        }}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Actions ▾
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Actions"
          className="absolute top-full z-10 mt-1.5 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % ITEMS.length); }
            if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c - 1 + ITEMS.length) % ITEMS.length); }
            if (e.key === "Escape") close(true);
          }}
        >
          {ITEMS.map((item, i) => (
            <button
              key={item}
              ref={(el) => { itemRefs.current[i] = el; }}
              role="menuitem"
              tabIndex={i === cursor ? 0 : -1}
              onClick={() => choose(item)}
              onMouseMove={() => setCursor(i)}
              className={`block w-full px-3.5 py-2 text-left text-sm focus:outline-none ${
                i === cursor
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        {chosen ? `chose: ${chosen.toLowerCase()}` : "keyboard works too"}
      </span>
    </div>
  );
}
