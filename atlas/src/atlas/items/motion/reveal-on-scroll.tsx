"use client";

import { useEffect, useRef, useState } from "react";

export function RevealOnScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setShown(true),
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function RevealOnScrollDemo() {
  return (
    <div className="w-full max-w-md py-4">
      <p className="text-sm text-neutral-400 dark:text-neutral-500">
        Scroll down — each card reveals once, a quarter into view.
      </p>
      <div className="mt-[40vh] space-y-[30vh] pb-24">
        {["First", "Second", "Third"].map((label) => (
          <RevealOnScroll key={label}>
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="font-serif text-lg text-neutral-900 dark:text-neutral-100">
                {label} card
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Enters with a small rise; never replays on the way back up.
              </p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
