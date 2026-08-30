"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Why animate grid rows?",
    a: "Animating grid-template-rows from 0fr to 1fr transitions to the content's intrinsic height — no measuring, no max-height guesses.",
  },
  {
    q: "Does it work with any content?",
    a: "Yes. The inner wrapper just needs overflow-hidden so the collapsing row clips cleanly.",
  },
  {
    q: "What about reduced motion?",
    a: "The transition collapses to an instant toggle under prefers-reduced-motion.",
  },
];

export function AccordionReveal() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="w-full max-w-md divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100"
            >
              {item.q}
              <span
                className={`text-neutral-400 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-4 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
