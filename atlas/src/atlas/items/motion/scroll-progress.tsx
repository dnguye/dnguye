"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? el.scrollTop / max : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-neutral-200 dark:bg-neutral-800">
      <div
        className="h-full origin-left bg-orange-600 transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export function ScrollProgressDemo() {
  return (
    <div className="w-full max-w-md">
      <ScrollProgress />
      <div className="space-y-6 py-6">
        <h2 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100">
          Scroll this frame
        </h2>
        {Array.from({ length: 8 }).map((_, i) => (
          <p key={i} className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            The rail at the top of the frame tracks reading progress. It is a fixed 2px bar
            scaled on the X axis, so it never causes layout work while scrolling — paragraph{" "}
            {i + 1} of 8.
          </p>
        ))}
      </div>
    </div>
  );
}
