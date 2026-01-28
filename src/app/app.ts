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
