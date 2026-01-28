import { Injectable, effect, signal } from '@angular/core';

export type RecognitionKind = 'phone' | 'time' | 'email' | 'link' | 'color';
export type ColorFormat = 'rgba' | 'argb';

type RecognitionSettingsState = {
  phone: boolean;
  time: boolean;
  timeShowFormatted: boolean;
  email: boolean;
  link: boolean;
  color: boolean;
  colorFormat: ColorFormat;
};

const STORAGE_KEY = 'json-editor:recognition-settings:v1';

const DEFAULT_STATE: RecognitionSettingsState = {
  phone: true,
  time: true,
  timeShowFormatted: true,
  email: true,
  link: true,
  color: true,
  colorFormat: 'rgba',
};

@Injectable({ providedIn: 'root' })
export class RecognitionSettingsService {
  readonly phone = signal(DEFAULT_STATE.phone);
  readonly time = signal(DEFAULT_STATE.time);
  readonly timeShowFormatted = signal(DEFAULT_STATE.timeShowFormatted);
  readonly email = signal(DEFAULT_STATE.email);
  readonly link = signal(DEFAULT_STATE.link);
  readonly color = signal(DEFAULT_STATE.color);
  readonly colorFormat = signal<ColorFormat>(DEFAULT_STATE.colorFormat);

  constructor() {
    this.loadFromStorage();

    effect(() => {
      const state: RecognitionSettingsState = {
        phone: this.phone(),
        time: this.time(),
        timeShowFormatted: this.timeShowFormatted(),
        email: this.email(),
        link: this.link(),
        color: this.color(),
        colorFormat: this.colorFormat(),
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage errors (private mode / quota).
      }
    });
  }

  isEnabled(kind: RecognitionKind): boolean {
    switch (kind) {
      case 'phone':
        return this.phone();
      case 'time':
        return this.time();
      case 'email':
        return this.email();
      case 'link':
        return this.link();
      case 'color':
        return this.color();
      default:
        return true;
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<RecognitionSettingsState> | null;
      if (!parsed || typeof parsed !== 'object') return;

      if (typeof parsed.phone === 'boolean') this.phone.set(parsed.phone);
      if (typeof parsed.time === 'boolean') this.time.set(parsed.time);
      if (typeof parsed.timeShowFormatted === 'boolean') this.timeShowFormatted.set(parsed.timeShowFormatted);
      if (typeof parsed.email === 'boolean') this.email.set(parsed.email);
      if (typeof parsed.link === 'boolean') this.link.set(parsed.link);
      if (typeof parsed.color === 'boolean') this.color.set(parsed.color);

      if (parsed.colorFormat === 'rgba' || parsed.colorFormat === 'argb') {
        this.colorFormat.set(parsed.colorFormat);
      }
    } catch {
      // Ignore invalid JSON / storage errors.
    }
  }
}
