export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton-shimmer rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`}>
      <style>{`
        @keyframes skeleton-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        .skeleton-shimmer {
          background-image: linear-gradient(
            105deg, transparent 40%,
            rgba(255, 255, 255, 0.55) 50%, transparent 60%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.6s linear infinite;
        }
        .dark .skeleton-shimmer, [data-theme="dark"] .skeleton-shimmer {
          background-image: linear-gradient(
            105deg, transparent 40%,
            rgba(255, 255, 255, 0.07) 50%, transparent 60%
          );
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-shimmer { animation: none; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonDemo() {
  return (
    <div className="w-72 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}
