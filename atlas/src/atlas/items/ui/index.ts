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
import { DialogDemo } from "./dialog";
import { DropdownMenu } from "./dropdown-menu";
import { TooltipDemo } from "./tooltip";
import { ToastDemo } from "./toast";
import { SwitchDemo } from "./switch";
import { CheckboxRadioDemo } from "./checkbox-radio";
import { SelectDemo } from "./native-select";
import { AvatarStackDemo } from "./avatar-stack";
import { DataTable } from "./data-table";
import { Pagination } from "./pagination";
import { ProgressDemo } from "./progress";

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

  {
    slug: "native-select",
    collection: "ui",
    group: "Inputs",
    name: "Select",
    summary:
      "A styled native <select> — correct on every platform, keyboard, and screen reader. Style the closed control; leave the menu to the OS.",
    tags: ["input", "select", "form"],
    kind: "component",
    files: [{ path: "components/select.tsx", lang: "tsx", source: "ui/native-select.tsx" }],
    Preview: SelectDemo,
    notes: {
      integration: ["Reach for the search combobox instead only when the list is long enough to need filtering."],
    },
  },
  {
    slug: "switch",
    collection: "ui",
    group: "Selection",
    name: "Switch",
    summary:
      "A labelled toggle with role=switch — settings that apply immediately, not form fields awaiting a submit.",
    tags: ["selection", "toggle", "settings"],
    kind: "component",
    files: [{ path: "components/switch.tsx", lang: "tsx", source: "ui/switch.tsx" }],
    Preview: SwitchDemo,
    notes: {
      a11y: ["role=switch with aria-checked; the whole label row is the hit target."],
    },
  },
  {
    slug: "checkbox-radio",
    collection: "ui",
    group: "Selection",
    name: "Checkbox & radio",
    summary:
      "Native inputs restyled with appearance-none — real form semantics, custom look, zero JavaScript.",
    tags: ["selection", "form", "css-only"],
    kind: "component",
    files: [{ path: "components/checkbox-radio.tsx", lang: "tsx", source: "ui/checkbox-radio.tsx" }],
    Preview: CheckboxRadioDemo,
    notes: {
      a11y: ["Radios are grouped in a fieldset with a legend; everything works with native keyboard behavior."],
    },
  },
  {
    slug: "dialog",
    collection: "ui",
    group: "Overlays",
    name: "Confirm dialog",
    summary:
      "Built on the native <dialog> element — focus trap, Esc-to-close, light-dismiss, and a ::backdrop for free.",
    tags: ["overlay", "dialog", "modal"],
    kind: "component",
    stage: { height: 380 },
    files: [{ path: "components/confirm-dialog.tsx", lang: "tsx", source: "ui/dialog.tsx" }],
    Preview: DialogDemo,
    notes: {
      a11y: ["showModal() makes the rest of the page inert while open — no manual focus management."],
    },
  },
  {
    slug: "dropdown-menu",
    collection: "ui",
    group: "Overlays",
    name: "Dropdown menu",
    summary:
      "An actions menu with arrow-key navigation, Escape, and click-outside — the whole pattern in ~70 lines.",
    tags: ["overlay", "menu", "keyboard"],
    kind: "component",
    stage: { height: 340 },
    files: [{ path: "components/dropdown-menu.tsx", lang: "tsx", source: "ui/dropdown-menu.tsx" }],
    Preview: DropdownMenu,
  },
  {
    slug: "tooltip",
    collection: "ui",
    group: "Overlays",
    name: "Tooltip",
    summary:
      "A CSS-only tooltip that appears on hover and keyboard focus alike, wired up with aria-describedby.",
    tags: ["overlay", "tooltip", "css-only"],
    kind: "component",
    files: [{ path: "components/tooltip.tsx", lang: "tsx", source: "ui/tooltip.tsx" }],
    Preview: TooltipDemo,
    notes: {
      a11y: ["Shows on focus-within, so keyboard users get the same hint as pointer users."],
    },
  },
  {
    slug: "avatar-stack",
    collection: "ui",
    group: "Data",
    name: "Avatar stack",
    summary:
      "Overlapping initials avatars with deterministic oklch tints per person and a +N overflow chip.",
    tags: ["data", "avatar", "people"],
    kind: "component",
    files: [{ path: "components/avatar-stack.tsx", lang: "tsx", source: "ui/avatar-stack.tsx" }],
    Preview: AvatarStackDemo,
  },
  {
    slug: "data-table",
    collection: "ui",
    group: "Data",
    name: "Sortable table",
    summary:
      "A dense data table with clickable, aria-sort-annotated headers and threshold coloring on the numbers.",
    tags: ["data", "table", "sorting"],
    kind: "component",
    stage: { height: 380 },
    files: [{ path: "components/data-table.tsx", lang: "tsx", source: "ui/data-table.tsx" }],
    Preview: DataTable,
  },
  {
    slug: "pagination",
    collection: "ui",
    group: "Navigation",
    name: "Pagination",
    summary:
      "Numbered pages with ellipsis windows around the current page — aria-current marks where you are.",
    tags: ["navigation", "pagination"],
    kind: "component",
    files: [{ path: "components/pagination.tsx", lang: "tsx", source: "ui/pagination.tsx" }],
    Preview: Pagination,
  },
  {
    slug: "toast",
    collection: "ui",
    group: "Feedback",
    name: "Toast queue",
    summary:
      "Stacking, self-dismissing notifications in an aria-live region — announcements without stealing focus.",
    tags: ["feedback", "toast", "notification"],
    kind: "component",
    stage: { height: 380 },
    files: [{ path: "components/toast.tsx", lang: "tsx", source: "ui/toast.tsx" }],
    Preview: ToastDemo,
    notes: {
      a11y: ["The container is aria-live=polite; each toast still offers a manual dismiss."],
    },
  },
  {
    slug: "progress",
    collection: "ui",
    group: "Feedback",
    name: "Progress bars",
    summary:
      "Determinate bars with real progressbar semantics, plus an indeterminate sweep for unknowable waits.",
    tags: ["feedback", "progress", "loading"],
    kind: "component",
    files: [{ path: "components/progress.tsx", lang: "tsx", source: "ui/progress.tsx" }],
    Preview: ProgressDemo,
  },
];
