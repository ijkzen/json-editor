import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, effect, signal } from '@angular/core';

type ThemeState = {
  darkMode: boolean;
};

const STORAGE_KEY = 'json-editor:theme-settings:v1';

@Injectable({ providedIn: 'root' })
export class ThemeSettingsService {
  readonly darkMode = signal(false);

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.loadFromStorageOrSystem();

    effect(() => {
      const enabled = this.darkMode();

      const root = this.document.documentElement;
      root.classList.toggle('dark', enabled);

      const state: ThemeState = { darkMode: enabled };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage errors (private mode / quota).
      }
    });
  }

  private loadFromStorageOrSystem(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThemeState> | null;
        if (parsed && typeof parsed === 'object' && typeof parsed.darkMode === 'boolean') {
          this.darkMode.set(parsed.darkMode);
          return;
        }
      }
    } catch {
      // Ignore invalid JSON / storage errors.
    }

    try {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
      this.darkMode.set(Boolean(prefersDark));
    } catch {
      this.darkMode.set(false);
    }
  }
}
