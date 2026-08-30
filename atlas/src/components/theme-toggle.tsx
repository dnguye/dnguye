"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="text-muted hover:text-ink flex size-8 items-center justify-center rounded-md border border-line transition-colors"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* CSS decides which icon shows, so SSR needs no theme knowledge. */}
      <SunIcon className="hidden size-3.5 dark:block" />
      <MoonIcon className="size-3.5 dark:hidden" />
    </button>
  );
}
