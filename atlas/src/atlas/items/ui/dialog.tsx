"use client";

import { useRef } from "react";

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  trigger,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm?: () => void;
  trigger: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        {trigger}
      </button>
      {/* Native <dialog>: focus trap, Esc-to-close, and ::backdrop for free. */}
      <dialog
        ref={ref}
        closedby="any"
        // Fallback light-dismiss where `closedby` is unsupported: a click that
        // hits the <dialog> itself (not its children) landed on the backdrop.
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-80 rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <form method="dialog" className="flex flex-col gap-3 p-6">
          <h2 className="font-serif text-lg">{title}</h2>
          <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{body}</p>
          <div className="mt-2 flex justify-end gap-2">
            <button
              value="cancel"
              className="rounded-md px-3.5 py-2 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              value="confirm"
              onClick={onConfirm}
              className="rounded-md bg-red-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function DialogDemo() {
  return (
    <ConfirmDialog
      trigger="Delete workspace…"
      title="Delete this workspace?"
      body="All projects and their history will be removed. This cannot be undone."
      confirmLabel="Delete"
    />
  );
}
