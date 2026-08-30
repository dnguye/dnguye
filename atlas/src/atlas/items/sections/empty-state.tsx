export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-neutral-300 px-8 py-14 text-center dark:border-neutral-700">
      <svg
        aria-hidden="true"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className="text-neutral-300 dark:text-neutral-600"
      >
        <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h3 className="mt-4 font-serif text-lg text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="mt-1.5 max-w-[36ch] text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        {body}
      </p>
      <button
        onClick={onAction}
        className="mt-5 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function EmptyStateDemo() {
  return (
    <EmptyState
      title="No archives yet"
      body="When a project wraps, its archive lands here — searchable and shareable."
      actionLabel="Archive a project"
    />
  );
}
