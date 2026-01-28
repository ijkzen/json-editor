# Copilot instructions (json-editor)

## Project snapshot
- Angular v21 standalone app (no NgModules). Entry: `src/main.ts` bootstraps `App`.
- UI = Angular Material + Tailwind; global styles in `src/styles.scss` (Material theme + `@tailwind ...`).
- Templates use built-in control flow (`@if`, `@for`) and avoid legacy structural directives.

## Dev workflows (preferred)
- Install: `pnpm i` (repo uses `pnpm@10`; see `package.json#packageManager`).
- Dev server: `pnpm start` (http://localhost:4200).
- Unit tests: `pnpm test` (Angular builder + Vitest; see `README.md`). Runs in watch mode.
- Build: `pnpm build`.
- Build (watch): `pnpm watch`.

## Architecture & data flow (read these first)
- `App` (`src/app/app.ts` + `src/app/app.html`) owns state via Angular `signal()`:
	- `jsonText` → passed to `JsonTextEditorComponent`.
	- `parseError` + `lastValidValue` → tree renders `lastValidValue()` so UI stays stable when JSON is invalid.
- Parsing happens in `App.reparse()` using `tryParseJson()`.
- Parsing + editor highlighting lives in `src/app/lib/json-parse.ts`:
	- `tryParseJson()` returns `{ok,value}` or `{ok:false,error:{message,position}}`.
	- `buildErrorHighlightedHtml()` escapes HTML and wraps the error character.
- Tree rendering is recursive:
	- `JsonTreeComponent` → `JsonNodeComponent` (`src/app/components/json-tree/*`).
	- `JsonNodeComponent` uses `getJsonNodeType()` from `src/app/lib/json-types.ts` and expands only depth 0 by default.
- “Smart tags” (time/link/email/phone/color/IMG) come from `src/app/lib/string-tags.ts`.
- Tag toggles are persisted in `RecognitionSettingsService` (`src/app/lib/recognition-settings.service.ts`) using signals + an `effect()` writing to `localStorage`.

## Local conventions to follow
- Components are standalone-by-default in Angular v21: do NOT add `standalone: true` to decorators.
- Components list explicit `imports: [...]` locally (see `src/app/components/**`).
- Prefer `ChangeDetectionStrategy.OnPush` (used across leaf components).
- Dependency injection: prefer constructor injection (keep existing style).
- State is typically `signal()`; templates call signals as functions (e.g. `editorOpen()`).
- Templates: use `@if/@for` (and `track ...` in `@for`); do NOT introduce `*ngIf/*ngFor`.
- Styling: Tailwind utilities in templates; avoid `ngClass/ngStyle`.
	- Prefer `[class.foo]="cond"` / `[class]="expr"` bindings.
	- Avoid class string interpolation unless necessary.

## Gotchas / safety
- The editor overlay uses `[innerHTML]` with `DomSanitizer.bypassSecurityTrustHtml()` in `JsonTextEditorComponent`.
	- If you change highlighting HTML, keep `escapeHtml()` correct in `src/app/lib/json-parse.ts`.
	- If you change highlight classes, update `tailwind.config.js#safelist`.

## Where to implement changes
- New recognition logic: edit `src/app/lib/string-tags.ts` and gate it via `RecognitionSettingsService.isEnabled()`.
- Tree UI behavior (expand/collapse, formatting, links): `src/app/components/json-tree/json-node.component.ts|.html`.
- Base64 image preview dialog: `src/app/components/json-tree/json-image-dialog.component.ts`.
- Editor behavior (highlighting/scroll sync): `src/app/components/json-text-editor/*`.
