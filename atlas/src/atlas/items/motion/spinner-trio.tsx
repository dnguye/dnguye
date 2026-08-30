export function RingSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="size-6 animate-spin rounded-full border-2 border-neutral-200 border-t-orange-600 motion-reduce:animate-none dark:border-neutral-700 dark:border-t-orange-500"
    />
  );
}

export function DotsSpinner() {
  return (
    <div role="status" aria-label="Loading" className="flex items-center gap-1.5">
      <style>{`
        @keyframes dot-pulse {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        .dot-pulse { animation: dot-pulse 1.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .dot-pulse { animation: none; } }
      `}</style>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="dot-pulse size-1.5 rounded-full bg-neutral-600 dark:bg-neutral-300"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function BarsSpinner() {
  return (
    <div role="status" aria-label="Loading" className="flex items-end gap-1">
      <style>{`
        @keyframes bar-bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        .bar-bounce { animation: bar-bounce 1s ease-in-out infinite; transform-origin: bottom; }
        @media (prefers-reduced-motion: reduce) { .bar-bounce { animation: none; } }
      `}</style>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="bar-bounce h-5 w-1 rounded-sm bg-orange-600 dark:bg-orange-500"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function SpinnerTrioDemo() {
  return (
    <div className="flex items-center gap-12">
      <RingSpinner />
      <DotsSpinner />
      <BarsSpinner />
    </div>
  );
}
