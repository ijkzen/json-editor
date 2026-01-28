import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JsonTextEditorComponent } from './components/json-text-editor/json-text-editor.component';
import { JsonTreeComponent } from './components/json-tree/json-tree.component';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { JsonParseError, tryParseJson } from './lib/json-parse';
import { JsonValue } from './lib/json-types';
import { ThemeSettingsService } from './lib/theme-settings.service';

const JSON_TEXT_STORAGE_KEY = 'json-editor:saved-json-text:v1';

const SAMPLE_JSON = `{
  "user": {
    "name": "Alice",
    "phone": "+86 138-0013-8000",
    "mobileNumber": 13800138000,
    "email": "support@example.com",
    "website": "https://angular.dev",
    "favoriteColor": "#7c3aed",
    "favoriteColorRgba": "rgba(124, 58, 237, 0.65)",
    "favoriteColorHex8Rgba": "#7C3AEDA6",
    "favoriteColorHex8Argb": "#A67C3AED",
    "favoriteColorArgb": "0xA67C3AED",
    "age": 28,
    "vip": true,
    "createdAtMs": 1759251661333,
    "createdAtSec": 1759251661,
    "createdAtMsStr": "1759251661333",
    "createdAtSecStr": "1759251661",
    "isoTimeUtc": "2026-01-29T07:30:45.333Z",
    "isoTimeOffset": "2026-01-29T15:30:45.333+08:00",
    "avatarPngBase64": "data:image/jpeg;base64,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",
    "tags": ["dev", "music", "#22c55e"],
    "profile": null
  },
  "items": [
    { "id": 1, "name": "Pen", "price": 3.5 },
    { "id": 2, "name": "Notebook", "price": 12 }
  ]
}`;

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSidenavModule,
    JsonTextEditorComponent,
    JsonTreeComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('json-editor');
  protected readonly editorOpen = signal(true);

  protected readonly jsonText = signal('');
  protected readonly parseError = signal<JsonParseError | null>(null);
  protected readonly lastValidValue = signal<JsonValue>({});

  constructor(
    private readonly dialog: MatDialog,
    protected readonly themeSettings: ThemeSettingsService,
  ) {
    const restored = this.loadSavedJsonText();
    const initialText = restored ?? SAMPLE_JSON;
    this.jsonText.set(initialText);
    this.reparse(initialText, { persist: false });
  }

  protected openSettings(): void {
    this.dialog.open(SettingsDialogComponent, {
      maxWidth: 'min(680px, 92vw)',
      width: 'min(680px, 92vw)',
      autoFocus: false,
    });
  }

  protected toggleEditor(): void {
    this.editorOpen.set(!this.editorOpen());
  }

  protected resetSample(): void {
    this.onTextChange(SAMPLE_JSON);
  }

  protected onTextChange(text: string): void {
    this.jsonText.set(text);
    this.reparse(text);
  }

  protected formatJson(): void {
    if (this.parseError()) return;
    try {
      const formatted = JSON.stringify(this.lastValidValue(), null, 2);
      this.jsonText.set(formatted);
    } catch {
      // Ignore formatting errors.
    }
  }

  private reparse(text: string, options?: { persist?: boolean }): void {
    const persist = options?.persist ?? true;
    const result = tryParseJson(text);
    if (result.ok) {
      this.parseError.set(null);
      this.lastValidValue.set(result.value as JsonValue);
      if (persist) this.saveJsonText(text);
      return;
    }
    this.parseError.set(result.error);
  }

  private loadSavedJsonText(): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      if (typeof localStorage.getItem !== 'function') return null;
      const value = localStorage.getItem(JSON_TEXT_STORAGE_KEY);
      if (!value) return null;
      const parsed = tryParseJson(value);
      return parsed.ok ? value : null;
    } catch {
      return null;
    }
  }

  private saveJsonText(text: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      if (typeof localStorage.setItem !== 'function') return;
      localStorage.setItem(JSON_TEXT_STORAGE_KEY, text);
    } catch {
      // Ignore storage errors (e.g., privacy mode/quota).
    }
  }
}
