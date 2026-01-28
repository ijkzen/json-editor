# JSON Editor (Tree View)

[English](README.md) | [简体中文](README.zh-CN.md)

A lightweight JSON text editor + tree viewer built with Angular 21 (standalone), Angular Material, and Tailwind CSS.

## Features

- Text editor with an overlay highlighter for JSON parse errors (highlights the error character position when available).
- Collapsible editor panel.
- Recursive tree view with expand/collapse (expands only the root level by default).
- Type coloring for `string | number | boolean | null | array | object`.
- Smart tags for values:
	- `time`: detects Unix timestamps (seconds/ms) and ISO 8601 strings; optionally shows a formatted time.
	- `link`: detects `http(s)://...` (and `www.`) and opens in a new tab.
	- `email`: detects emails and opens via `mailto:`.
	- `phone`: detects phone-like strings/numbers.
	- `color`: detects common CSS color formats (including ambiguous 8-digit hex, configurable as `#RRGGBBAA` vs `#AARRGGBB`).
- Settings dialog; toggles persist to `localStorage`.

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
