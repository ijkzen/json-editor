# Copilot instructions (json-editor)

## Project snapshot
- Angular v21 standalone app, no NgModules. Entry: `src/main.ts` bootstraps `App`.
- UI = Angular Material + Tailwind; global styles in `src/styles.scss` (Material theme + `@tailwind ...`).

## Dev workflows (preferred)
- Install: `pnpm i` (repo uses `pnpm@10`; see `package.json#packageManager`).
- Dev server: `pnpm start` (http://localhost:4200).
- Unit tests: `pnpm test` (Angular builder + Vitest; see `README.md`).
- Build: `pnpm build`.

## Architecture & data flow (read these first)
- `App` (`src/app/app.ts` + `src/app/app.html`) owns the state via Angular `signal()`:
	- `jsonText` → passed to `JsonTextEditorComponent`.
	- `parseError` + `lastValidValue` → keeps rendering the last valid tree when current JSON is invalid.
- Parsing + editor highlighting lives in `src/app/lib/json-parse.ts`:
	- `tryParseJson()` returns `{ok,value}` or `{ok:false,error:{message,position}}`.
	- `buildErrorHighlightedHtml()` escapes HTML and wraps the error character.
- Tree rendering is recursive:
	- `JsonTreeComponent` → `JsonNodeComponent` (`src/app/components/json-tree/*`).
	- `JsonNodeComponent` uses `getJsonNodeType()` from `src/app/lib/json-types.ts` and expands only depth 0 by default.
- “Smart tags” (time/link/email/phone/color) come from `src/app/lib/string-tags.ts`.
- Tag toggles are persisted in `RecognitionSettingsService` (`src/app/lib/recognition-settings.service.ts`) using signals + an `effect()` writing to `localStorage`.

## Local conventions to follow
- Standalone components + explicit `imports: [...]` (see `src/app/components/**`).
- Prefer `ChangeDetectionStrategy.OnPush` for components (all leaf components use it).
- State is typically `signal()`; templates call signals as functions (e.g. `editorOpen()`).
- Templates use both legacy structural directives (`*ngIf`, `*ngFor`) and the new built-in control flow (`@if`). Match the style of the file you’re editing.
- Tailwind utility classes are used heavily in templates; component SCSS is for “hard” layout details (e.g. editor overlay in `json-text-editor.component.scss`).

## Gotchas / safety
- The editor overlay uses `[innerHTML]` with `DomSanitizer.bypassSecurityTrustHtml()` in `JsonTextEditorComponent`; keep `escapeHtml()` in `json-parse.ts` correct if you change highlighting.
- `tailwind.config.js` safelists highlight classes (`bg-red-500/35`, `rounded-sm`) used by the generated HTML.

## Where to implement changes
- New recognition logic: edit `src/app/lib/string-tags.ts` and gate it via `RecognitionSettingsService.isEnabled()`.
- Tree UI behavior (expand/collapse, formatting, links): `src/app/components/json-tree/json-node.component.ts|.html`.
- Editor behavior (highlighting/scroll sync): `src/app/components/json-text-editor/*`.
