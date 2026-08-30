"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#";

export function TextScramble({ phrases }: { phrases: string[] }) {
  const [display, setDisplay] = useState(phrases[0]);
  const index = useRef(0);
  const frame = useRef<ReturnType<typeof setInterval>>(undefined);

  const scrambleTo = useCallback((next: string) => {
    clearInterval(frame.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(next);
      return;
    }
    let step = 0;
    const total = next.length * 3;
    frame.current = setInterval(() => {
      step += 1;
      const settled = Math.floor((step / total) * next.length);
      setDisplay(
        next
          .split("")
          .map((ch, i) =>
            i < settled || ch === " "
              ? ch
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          )
          .join("")
      );
      if (step >= total) clearInterval(frame.current);
    }, 30);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      index.current = (index.current + 1) % phrases.length;
      scrambleTo(phrases[index.current]);
    }, 2600);
    return () => {
      clearInterval(timer);
      clearInterval(frame.current);
    };
  }, [phrases, scrambleTo]);

  return (
    <span aria-live="polite" className="font-mono">
      {display}
    </span>
  );
}

export function TextScrambleDemo() {
  return (
    <div className="text-center">
      <div className="text-xl text-neutral-900 dark:text-neutral-100">
        <TextScramble phrases={["Design once.", "Hand off cleanly.", "Ship everywhere."]} />
      </div>
      <p className="mt-3 font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        cycles every 2.6s
      </p>
    </div>
  );
}
