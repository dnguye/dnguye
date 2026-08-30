export function ScaleInBlur({ children }: { children: React.ReactNode }) {
  return (
    <div className="scale-in-blur">
      <style>{`
        @keyframes scale-in-blur {
          from { opacity: 0; transform: scale(0.94); filter: blur(8px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        .scale-in-blur {
          animation: scale-in-blur 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .scale-in-blur { animation: none; }
        }
      `}</style>
      {children}
    </div>
  );
}

export function ScaleInBlurDemo() {
  return (
    <ScaleInBlur>
      <div className="w-72 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
          New workspace
        </div>
        <div className="mt-1.5 font-serif text-xl text-neutral-900 dark:text-neutral-100">
          Field notes
        </div>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Everything settles into focus at once — scale, opacity, and blur resolve together.
        </p>
      </div>
    </ScaleInBlur>
  );
}
