import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { JsonTextEditorComponent } from './components/json-text-editor/json-text-editor.component';
import { JsonTreeComponent } from './components/json-tree/json-tree.component';
import { JsonParseError, tryParseJson } from './lib/json-parse';
import { JsonValue } from './lib/json-types';

const SAMPLE_JSON = `{
  "user": {
    "name": "Alice",
    "phone": "+86 138-0013-8000",
    "favoriteColor": "#7c3aed",
    "age": 28,
    "vip": true,
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
    MatSidenavModule,
    JsonTextEditorComponent,
    JsonTreeComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('json-editor');
  protected readonly editorOpen = signal(true);

  protected readonly jsonText = signal(SAMPLE_JSON);
  protected readonly parseError = signal<JsonParseError | null>(null);
  protected readonly lastValidValue = signal<JsonValue>({});

  constructor() {
    this.reparse(SAMPLE_JSON);
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

  private reparse(text: string): void {
    const result = tryParseJson(text);
    if (result.ok) {
      this.parseError.set(null);
      this.lastValidValue.set(result.value as JsonValue);
      return;
    }
    this.parseError.set(result.error);
  }
}
