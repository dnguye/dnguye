"use client";

import { useEffect, useId, useRef, useState } from "react";

const ITEMS = ["Rename", "Duplicate", "Move to…", "Archive"];

export function DropdownMenu() {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  function choose(item: string) {
    setChosen(item);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative flex flex-col items-center gap-3">
      {/* Focus stays on the trigger; aria-activedescendant tells assistive
          tech which menuitem the arrow keys are on. */}
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-activedescendant={open ? `${menuId}-item-${cursor}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openMenu();
            return;
          }
          if (open && e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => (c + 1) % ITEMS.length); }
          if (open && e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => (c - 1 + ITEMS.length) % ITEMS.length); }
          if (open && e.key === "Enter") { e.preventDefault(); choose(ITEMS[cursor]); }
          if (e.key === "Escape") setOpen(false);
        }}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Actions ▾
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Actions"
          className="absolute top-full z-10 mt-1.5 w-44 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        >
          {ITEMS.map((item, i) => (
            <button
              key={item}
              id={`${menuId}-item-${i}`}
              role="menuitem"
              tabIndex={-1}
              // pointerdown, so the choice lands before the trigger's blur closes the menu
              onPointerDown={(e) => { e.preventDefault(); choose(item); }}
              onMouseMove={() => setCursor(i)}
              className={`block w-full px-3.5 py-2 text-left text-sm ${
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
