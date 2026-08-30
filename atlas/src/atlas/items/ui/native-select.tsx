export function Select({
  id,
  label,
  options,
  defaultValue,
}: {
  id: string;
  label: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
      </label>
      <div className="relative">
        {/* The native select: correct on every platform, keyboard, and screen
            reader. Style the closed control; leave the menu to the OS. */}
        <select
          id={id}
          defaultValue={defaultValue}
          className="h-9 w-full appearance-none rounded-md border border-neutral-300 bg-white pr-8 pl-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-neutral-400"
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function SelectDemo() {
  return (
    <div className="w-64 space-y-4">
      <Select
        id="region"
        label="Primary region"
        options={["us-east", "us-west", "eu-central", "ap-southeast"]}
        defaultValue="eu-central"
      />
      <Select id="tier" label="Instance tier" options={["Shared", "Dedicated", "Isolated"]} />
    </div>
  );
}
