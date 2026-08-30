"use client";

import { useRef, useState } from "react";

export function TiltCard({ children, max = 10 }: { children: React.ReactNode; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  function onPointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(
      `perspective(700px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`
    );
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTransform("")}
      className="transition-transform duration-200 ease-out will-change-transform"
      style={{ transform }}
    >
      {children}
    </div>
  );
}

export function TiltCardDemo() {
  return (
    <TiltCard>
      <div className="w-64 rounded-xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-24 rounded-lg bg-gradient-to-br from-orange-200 to-orange-50 dark:from-orange-950 dark:to-neutral-900" />
        <div className="mt-4 font-serif text-lg text-neutral-900 dark:text-neutral-100">
          Terrain study
        </div>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Tilts toward the pointer, settles flat on leave.
        </p>
      </div>
    </TiltCard>
  );
}
