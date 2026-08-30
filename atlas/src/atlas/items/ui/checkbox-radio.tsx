export function Checkbox({
  id,
  label,
  defaultChecked,
}: {
  id: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5">
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer size-4 appearance-none rounded border border-neutral-400 bg-white checked:border-neutral-900 checked:bg-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:checked:border-neutral-100 dark:checked:bg-neutral-100"
      />
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="pointer-events-none absolute size-4 p-0.5 text-white opacity-0 peer-checked:opacity-100 dark:text-neutral-900"
      >
        <path d="M2.5 6.5 L5 9 L9.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-sm text-neutral-800 dark:text-neutral-200">{label}</span>
    </label>
  );
}

export function RadioGroup({
  name,
  legend,
  options,
  defaultValue,
}: {
  name: string;
  legend: string;
  options: string[];
  defaultValue?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-1 text-xs font-medium tracking-wide text-neutral-400 uppercase">
        {legend}
      </legend>
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-2.5">
          <input
            type="radio"
            name={name}
            value={option}
            defaultChecked={option === defaultValue}
            className="size-4 appearance-none rounded-full border border-neutral-400 bg-white checked:border-[5px] checked:border-neutral-900 dark:border-neutral-600 dark:bg-neutral-900 dark:checked:border-neutral-100"
          />
          <span className="text-sm text-neutral-800 dark:text-neutral-200">{option}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function CheckboxRadioDemo() {
  return (
    <div className="flex gap-14">
      <div className="relative flex flex-col gap-2.5">
        <div className="mb-1 text-xs font-medium tracking-wide text-neutral-400 uppercase">
          Notify on
        </div>
        <Checkbox id="c-deploys" label="Deploys" defaultChecked />
        <Checkbox id="c-failures" label="Failures" defaultChecked />
        <Checkbox id="c-comments" label="Comments" />
      </div>
      <RadioGroup
        name="cadence"
        legend="Cadence"
        options={["Instant", "Hourly", "Daily"]}
        defaultValue="Hourly"
      />
    </div>
  );
}
