"use client";

import { useRef, useState } from "react";

type Toast = { id: number; title: string; body: string };

export function ToastDemo() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  function push(title: string, body: string) {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, title, body }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }

  return (
    <div className="flex h-full min-h-[240px] w-full max-w-md flex-col items-center justify-center">
      <button
        onClick={() => push("Deploy started", `Build ${200 + nextId.current} is queued.`)}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Queue a deploy
      </button>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-in { animation: toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
        @media (prefers-reduced-motion: reduce) { .toast-in { animation: none; } }
      `}</style>
      {/* aria-live region: new toasts are announced without stealing focus. */}
      <div aria-live="polite" className="pointer-events-none absolute right-4 bottom-4 flex w-72 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="toast-in pointer-events-auto rounded-lg border border-neutral-200 bg-white p-3.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {toast.title}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {toast.body}
                </div>
              </div>
              <button
                aria-label="Dismiss"
                onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
