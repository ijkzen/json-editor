# JSON Editor (Tree View)

[English](README.md) | [简体中文](README.zh-CN.md)

A lightweight JSON text editor + tree viewer built with Angular 21 (standalone), Angular Material, and Tailwind CSS.

## Features

- Text editor with an overlay highlighter for JSON parse errors (highlights the error character position when available).
- One-click JSON formatting (only when JSON is valid).
- When JSON is invalid, the tree stays stable and shows the last valid parsed value.
- When JSON is valid, the current JSON text is persisted to `localStorage`; reopening the page restores it automatically (only restores syntactically valid JSON).
- Collapsible editor panel.
- Built-in sample JSON (reset with one click).
- Recursive tree view with expand/collapse (expands only the root level by default).
- Type coloring for `string | number | boolean | null | array | object`.
- Long strings are truncated in-place; click to view full content in a dialog.
- Smart tags for values:
	- `time`: detects Unix timestamps (seconds/ms) and ISO 8601 strings; optionally shows a formatted time.
	- `link`: detects `http(s)://...` (and `www.`) and opens in a new tab.
	- `email`: detects emails and opens via `mailto:`.
	- `phone`: detects phone-like strings/numbers.
	- `IMG`: detects base64 images (`data:image/...;base64,...` or raw base64 with common image headers). Shows `show` (preview) and `text` (view base64) actions.
	- `color`: detects common CSS color formats: `#RGB/#RGBA/#RRGGBB/#RRGGBBAA`, `rgb()/rgba()`, `hsl()/hsla()`, and `0xAARRGGBB`.
	  - Note: `#` 8-digit hex can be ambiguous; the tree can interpret it as `#RRGGBBAA` (RGBA) or `#AARRGGBB` (ARGB) based on settings.
- Settings dialog (dark mode + tag toggles); preferences persist to `localStorage`.

## Tech Stack

- Angular 21 (standalone components)
- Angular Material
- Tailwind CSS
- Unit tests via Angular builder + Vitest

## Getting Started

Prereqs: Node.js (LTS) and `pnpm` (this repo pins `pnpm@10`, see `package.json#packageManager`).

```bash
pnpm i
pnpm start
```

Then open `http://localhost:4200/`.

## Scripts

```bash
pnpm start   # dev server
pnpm test    # unit tests
pnpm build   # production build
pnpm watch   # dev build watch mode
```

## Code Map

- Parsing + error highlighting: `src/app/lib/json-parse.ts`
- App state (signals) + sample JSON: `src/app/app.ts`
- Editor overlay/highlight: `src/app/components/json-text-editor/`
- Tree rendering: `src/app/components/json-tree/`
- Smart tags: `src/app/lib/string-tags.ts`
- Tag toggles persistence: `src/app/lib/recognition-settings.service.ts`
- Dark mode persistence: `src/app/lib/theme-settings.service.ts`
