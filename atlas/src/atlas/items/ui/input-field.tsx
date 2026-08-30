export function Field({
  label,
  hint,
  error,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  id: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`h-9 rounded-md border bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-2 dark:bg-neutral-900 dark:text-neutral-100 ${
          error
            ? "border-red-600 focus:ring-red-600/25"
            : "border-neutral-300 focus:border-neutral-500 focus:ring-neutral-500/20 dark:border-neutral-700"
        }`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-neutral-500 dark:text-neutral-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldDemo() {
  return (
    <div className="flex w-72 flex-col gap-5">
      <Field
        id="workspace"
        label="Workspace name"
        placeholder="acme-inc"
        hint="Lowercase letters, numbers, and dashes."
      />
      <Field
        id="email"
        label="Billing email"
        defaultValue="ops@acme"
        error="Enter a complete email address."
      />
    </div>
  );
}
