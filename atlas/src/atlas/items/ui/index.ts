import type { Item } from "../../types";

import { ButtonSetDemo } from "./button-set";
import { SegmentedControlDemo } from "./segmented-control";
import { FieldDemo } from "./input-field";
import { SearchCombobox } from "./search-combobox";
import { StatCardDemo } from "./stat-card";
import { PricingCardDemo } from "./pricing-card";
import { Tabs } from "./tabs";
import { BreadcrumbDemo } from "./breadcrumb";
import { AlertsDemo } from "./inline-alerts";
import { BadgeSetDemo } from "./badge-set";

export const items: Item[] = [
  {
    slug: "button-set",
    collection: "ui",
    group: "Buttons",
    name: "Button set",
    summary:
      "Four variants, three sizes, disabled and loading states — one component, no dependency on a UI kit.",
    tags: ["button", "variants", "loading"],
    kind: "component",
    files: [{ path: "components/button.tsx", lang: "tsx", source: "ui/button-set.tsx" }],
    Preview: ButtonSetDemo,
    notes: {
      a11y: ["Loading disables the button so it cannot be double-submitted."],
    },
  },
  {
    slug: "segmented-control",
    collection: "ui",
    group: "Buttons",
    name: "Segmented control",
    summary:
      "An inset toggle group for small, exclusive choices — the pressed segment lifts on a shadow, not a color shout.",
    tags: ["toggle", "button"],
    kind: "component",
    files: [
      { path: "components/segmented-control.tsx", lang: "tsx", source: "ui/segmented-control.tsx" },
    ],
    Preview: SegmentedControlDemo,
    notes: {
      a11y: ["Each segment carries aria-pressed; the group is labelled via aria-label."],
    },
  },
  {
    slug: "input-field",
    collection: "ui",
    group: "Inputs",
    name: "Input field",
    summary:
      "Label, hint, and error in one component — the error swaps the hint and wires itself up via aria-describedby.",
    tags: ["input", "form", "validation"],
    kind: "component",
    files: [{ path: "components/field.tsx", lang: "tsx", source: "ui/input-field.tsx" }],
    Preview: FieldDemo,
    notes: {
      a11y: [
        "aria-invalid is set when an error is present.",
        "Hint and error are announced through aria-describedby.",
      ],
    },
  },
  {
    slug: "search-combobox",
    collection: "ui",
    group: "Inputs",
    name: "Search combobox",
    summary:
      "A filtering combobox with full keyboard support — arrows, enter, escape — and correct ARIA roles, in ~80 lines.",
    tags: ["input", "combobox", "keyboard"],
    kind: "component",
    stage: { height: 360 },
    files: [
      { path: "components/search-combobox.tsx", lang: "tsx", source: "ui/search-combobox.tsx" },
    ],
    Preview: SearchCombobox,
    notes: {
      integration: ["Replace the PEOPLE constant with your data source; everything else is wiring."],
      a11y: ["role=combobox with aria-activedescendant tracks the highlighted option."],
    },
  },
  {
    slug: "stat-card",
    collection: "ui",
    group: "Cards",
    name: "Stat card",
    summary:
      "A metric tile with label, serif value, and a delta that only turns green when the movement is good news.",
    tags: ["card", "dashboard", "metric"],
    kind: "component",
    files: [{ path: "components/stat-card.tsx", lang: "tsx", source: "ui/stat-card.tsx" }],
    Preview: StatCardDemo,
  },
  {
    slug: "pricing-card",
    collection: "ui",
    group: "Cards",
    name: "Pricing card",
    summary:
      "A plan card with an inverted highlighted variant — features read as an em-dash list, one action at the foot.",
    tags: ["card", "pricing"],
    kind: "component",
    stage: { height: 460 },
    files: [{ path: "components/pricing-card.tsx", lang: "tsx", source: "ui/pricing-card.tsx" }],
    Preview: PricingCardDemo,
  },
  {
    slug: "tabs",
    collection: "ui",
    group: "Navigation",
    name: "Tabs",
    summary:
      "Underline tabs with roving tabindex and arrow-key navigation — the full WAI-ARIA tabs pattern without a library.",
    tags: ["navigation", "tabs", "keyboard"],
    kind: "component",
    files: [{ path: "components/tabs.tsx", lang: "tsx", source: "ui/tabs.tsx" }],
    Preview: Tabs,
    notes: {
      a11y: ["Arrow keys move between tabs; panels are labelled by their tab."],
    },
  },
  {
    slug: "breadcrumb",
    collection: "ui",
    group: "Navigation",
    name: "Breadcrumb",
    summary:
      "A slash-separated trail where only the current page is bold — aria-current marks it for assistive tech.",
    tags: ["navigation", "breadcrumb"],
    kind: "component",
    files: [{ path: "components/breadcrumb.tsx", lang: "tsx", source: "ui/breadcrumb.tsx" }],
    Preview: BreadcrumbDemo,
  },
  {
    slug: "inline-alerts",
    collection: "ui",
    group: "Feedback",
    name: "Inline alert set",
    summary:
      "Four tones — info, success, warning, danger — tinted with translucent washes so they sit on any surface.",
    tags: ["feedback", "alert", "status"],
    kind: "component",
    files: [{ path: "components/alert.tsx", lang: "tsx", source: "ui/inline-alerts.tsx" }],
    Preview: AlertsDemo,
    notes: {
      a11y: ["Danger uses role=alert (assertive); the rest use role=status."],
    },
  },
  {
    slug: "badge-set",
    collection: "ui",
    group: "Feedback",
    name: "Badge set",
    summary:
      "Mono-type status pills with an optional live dot — five tones matched to the alert set.",
    tags: ["feedback", "badge", "status"],
    kind: "component",
    files: [{ path: "components/badge.tsx", lang: "tsx", source: "ui/badge-set.tsx" }],
    Preview: BadgeSetDemo,
  },
];
