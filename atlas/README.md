# Atlas — a design library built for hand-off

An editorial, dark-first library of interface parts with three things on every
item page:

1. **Live preview** — the real component in an iframe, with viewport widths
   (360 / 768 / 1280 / fill + drag handle), light / dark / split themes,
   background switches, and a replay button for entrances.
2. **Code box** — the exact source, Shiki-highlighted at build time (zero
   client JS for highlighting), with per-file tabs and a copy button. The demo
   file that renders **is** the file shown — they cannot drift.
3. **Hand-off box** — one structured prompt written for a coding agent: what
   to build, dependencies (almost always none), the design tokens it relies
   on, the full source, integration steps, and acceptance checks. Copy, paste
   into Claude Code, done.

## Collections

| # | Collection | Contents |
|---|-----------|----------|
| 01 | **Motion** | Entrances, scroll effects, hover, loading, text, an easing reference |
| 02 | **Foundations** | 4 color schemes (Tailwind v4 tokens, light+dark), 3 type systems, elevation / radius / spacing scales |
| 03 | **UI** | Buttons, segmented control, inputs, combobox, cards, tabs, breadcrumb, alerts, badges |
| 04 | **Sections** | Heroes, logo cloud, testimonial, features, pricing, CTA, footer, 3 backgrounds, empty state |

Every demo is plain React + CSS + Tailwind — **no runtime dependencies** — so
copied code ports anywhere.

## Structure

```
app/(site)/                     contents page, /[collection], /[collection]/[item]
app/(preview)/preview/…         bare iframe target (own root layout, noindex)
src/atlas/
  collections.ts                collection + group metadata
  registry.ts                   items, grouping, search index, ref ids (M-01…)
  sources.server.ts             raw source registry (build-time fs read)
  handoff.ts                    the agent-prompt builder
  items/<collection>/           demo files — each one IS the shipped source
src/components/                 header, ⌘K palette, stage, code box, hand-off box
```

Everything is statically generated (98 pages); `/preview/*` is excluded from
robots.

## Develop

```bash
npm install
npm run dev        # http://localhost:3100
npm run build && npm run start
npm run lint && npm run typecheck
```

## Deploy

This app is standalone. Point a separate Netlify site (base directory
`atlas`) or Vercel project (root directory `atlas`) at the repo — configs for
both are included. The root repo's own deployment is untouched.

## Adding an item

1. Drop a demo file in `src/atlas/items/<collection>/` — it is both the
   rendered preview and the displayed/copied source.
2. Register it in that collection's `index.ts` (metadata, tags, files, notes).
3. Done: browse page, item page, preview route, search, and hand-off all pick
   it up. New collections are one entry in `collections.ts` plus an items dir.
