export type Palette = {
  name: string;
  light: Record<"bg" | "surface" | "line" | "ink" | "muted" | "accent" | "onAccent", string>;
  dark: Record<"bg" | "surface" | "line" | "ink" | "muted" | "accent" | "onAccent", string>;
};

export const porcelain: Palette = {
  name: "Porcelain",
  light: { bg: "#f7f7f8", surface: "#ffffff", line: "#e4e5e9", ink: "#1b1d21", muted: "#686c75", accent: "#4753c6", onAccent: "#ffffff" },
  dark: { bg: "#17181c", surface: "#1e2025", line: "#2b2e35", ink: "#e7e8eb", muted: "#9297a1", accent: "#8b96f8", onAccent: "#14151a" },
};

export const inkAndEmber: Palette = {
  name: "Ink & Ember",
  light: { bg: "#f6f4ef", surface: "#fdfcfa", line: "#e3dfd6", ink: "#211f1b", muted: "#6f6a61", accent: "#b8542e", onAccent: "#fdfcfa" },
  dark: { bg: "#121110", surface: "#1a1815", line: "#2a2724", ink: "#ece7dd", muted: "#8f897d", accent: "#d4683f", onAccent: "#121110" },
};

export const verdant: Palette = {
  name: "Verdant",
  light: { bg: "#f4f6f2", surface: "#fcfdfb", line: "#dfe5db", ink: "#1d231c", muted: "#66705f", accent: "#38714a", onAccent: "#fcfdfb" },
  dark: { bg: "#131713", surface: "#1a1f19", line: "#293028", ink: "#e4e9e1", muted: "#8d968a", accent: "#7fb08d", onAccent: "#131713" },
};

export const midnight: Palette = {
  name: "Midnight",
  light: { bg: "#f6f8fa", surface: "#ffffff", line: "#d9dee3", ink: "#24292f", muted: "#57606a", accent: "#0969da", onAccent: "#ffffff" },
  dark: { bg: "#0d1117", surface: "#161b22", line: "#262c36", ink: "#e6edf3", muted: "#8d96a0", accent: "#58a6ff", onAccent: "#0d1117" },
};

/** WCAG relative-luminance contrast ratio between two hex colors. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b2] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b2);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function Panel({ tokens, label }: { tokens: Palette["light"]; label: string }) {
  const ratio = contrast(tokens.ink, tokens.bg);
  return (
    <div
      className="flex w-52 flex-col gap-3 rounded-lg border p-4"
      style={{ background: tokens.bg, borderColor: tokens.line }}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: tokens.muted }}>
          {label}
        </span>
        <span className="font-mono text-[10px]" style={{ color: tokens.muted }}>
          {ratio.toFixed(1)}:1
        </span>
      </div>
      <div
        className="rounded-md border p-3"
        style={{ background: tokens.surface, borderColor: tokens.line }}
      >
        <div className="text-sm font-medium" style={{ color: tokens.ink }}>
          Weekly digest
        </div>
        <div className="mt-0.5 text-xs" style={{ color: tokens.muted }}>
          4 updates waiting
        </div>
        <div className="mt-3 flex gap-2">
          <span
            className="rounded px-2.5 py-1 text-xs font-medium"
            style={{ background: tokens.accent, color: tokens.onAccent }}
          >
            Open
          </span>
          <span
            className="rounded border px-2.5 py-1 text-xs"
            style={{ borderColor: tokens.line, color: tokens.muted }}
          >
            Later
          </span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {(["bg", "surface", "line", "muted", "ink", "accent"] as const).map((k) => (
          <span
            key={k}
            title={k}
            className="h-4 flex-1 rounded-sm border border-black/10"
            style={{ background: tokens[k] }}
          />
        ))}
      </div>
    </div>
  );
}

export function PalettePreview({ palette }: { palette: Palette }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Panel tokens={palette.light} label="Light" />
      <Panel tokens={palette.dark} label="Dark" />
    </div>
  );
}

export const PorcelainPreview = () => <PalettePreview palette={porcelain} />;
export const InkAndEmberPreview = () => <PalettePreview palette={inkAndEmber} />;
export const VerdantPreview = () => <PalettePreview palette={verdant} />;
export const MidnightPreview = () => <PalettePreview palette={midnight} />;
