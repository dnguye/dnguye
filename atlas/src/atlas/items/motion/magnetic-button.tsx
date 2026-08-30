"use client";

import { useRef, useState } from "react";

export function MagneticButton({
  children,
  strength = 0.35,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function onPointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    setOffset({
      x: (e.clientX - rect.left - rect.width / 2) * strength,
      y: (e.clientY - rect.top - rect.height / 2) * strength,
    });
  }

  return (
    <button
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
      className="rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-transform duration-200 ease-out will-change-transform dark:bg-neutral-100 dark:text-neutral-900"
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >
      {children}
    </button>
  );
}

export function MagneticButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <MagneticButton>Hold my gaze</MagneticButton>
      <p className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        move the pointer across it
      </p>
    </div>
  );
}
