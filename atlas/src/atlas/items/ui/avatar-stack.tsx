const HUES = [18, 152, 205, 260, 320];

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  // Hash the name so the same person gets the same tint in every stack.
  const hue = HUES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % HUES.length];
  return (
    <span
      title={name}
      className="flex size-9 items-center justify-center rounded-full font-mono text-[11px] font-medium ring-2 ring-white dark:ring-neutral-900"
      style={{
        background: `oklch(0.9 0.05 ${hue})`,
        color: `oklch(0.35 0.08 ${hue})`,
      }}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((name) => (
        <Avatar key={name} name={name} />
      ))}
      {rest > 0 ? (
        <span className="flex size-9 items-center justify-center rounded-full bg-neutral-200 font-mono text-[11px] text-neutral-600 ring-2 ring-white dark:bg-neutral-700 dark:text-neutral-200 dark:ring-neutral-900">
          +{rest}
        </span>
      ) : null}
    </div>
  );
}

export function AvatarStackDemo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <AvatarStack
        names={["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Margaret Hamilton", "Annie Easley", "Mary Jackson"]}
      />
      <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
        6 reviewers, 4 shown
      </span>
    </div>
  );
}
