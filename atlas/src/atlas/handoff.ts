import { site } from "./site";
import { getCollection } from "./collections";
import type { Item } from "./types";

const fence = "```";

/**
 * One copy-ready block written for a coding agent: what to build, what it
 * needs, the full source, and how to verify it landed.
 */
export function buildHandoff(item: Item, sources: Record<string, string>): string {
  const collection = getCollection(item.collection);
  const deps = item.deps ?? [];

  const lines: string[] = [];
  lines.push(`# Task: add "${item.name}" to this project`);
  lines.push(`Source: ${site.name} → ${collection?.name} → ${item.name}`);
  lines.push("");
  lines.push("## What it is");
  lines.push(item.summary);
  lines.push("");
  lines.push("## Requirements");
  lines.push("- React 19 + Tailwind CSS v4. If this project uses different versions or no Tailwind, adapt the class names — the structure and behavior are what matter.");
  lines.push(
    deps.length > 0
      ? `- Dependencies to install: ${deps.join(", ")} (\`npm install ${deps.join(" ")}\`)`
      : "- Dependencies: none. Do not add any."
  );
  if (item.tokens && item.tokens.length > 0) {
    lines.push(`- Design tokens this relies on (map to this project's equivalents, or add them): ${item.tokens.join(", ")}`);
  }
  lines.push("");
  lines.push("## Files to create");
  for (const file of item.files) {
    lines.push("");
    lines.push(`\`${file.path}\``);
    lines.push(`${fence}${file.lang}`);
    lines.push(sources[file.source].trimEnd());
    lines.push(fence);
  }
  lines.push("");
  lines.push("## Integration");
  const integration = item.notes?.integration ?? [];
  const steps =
    integration.length > 0
      ? integration
      : ["Import the component where it is needed and render it with this project's real content."];
  steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push("");
  lines.push("## Acceptance");
  lines.push("- [ ] Renders correctly in both light and dark mode");
  lines.push("- [ ] Honors prefers-reduced-motion");
  lines.push("- [ ] Keyboard focus is visible on all interactive elements");
  for (const a of item.notes?.a11y ?? []) {
    lines.push(`- [ ] ${a}`);
  }
  return lines.join("\n");
}
