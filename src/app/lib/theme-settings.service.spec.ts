import { TestBed } from '@angular/core/testing';
import { ThemeSettingsService } from './theme-settings.service';

describe('ThemeSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('applies html.dark when darkMode is enabled', () => {
    const service = TestBed.runInInjectionContext(() => new ThemeSettingsService(document));
    service.darkMode.set(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads darkMode from localStorage', () => {
    localStorage.setItem('json-editor:theme-settings:v1', JSON.stringify({ darkMode: true }));

    const service = TestBed.runInInjectionContext(() => new ThemeSettingsService(document));
    expect(service.darkMode()).toBe(true);
  });

  it('falls back to prefers-color-scheme when storage is empty', () => {
    const original = window.matchMedia;

    window.matchMedia = ((query: string) => {
      return {
        matches: query.includes('prefers-color-scheme: dark'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList;
    }) as typeof window.matchMedia;

    try {
      const service = TestBed.runInInjectionContext(() => new ThemeSettingsService(document));
      expect(service.darkMode()).toBe(true);
    } finally {
      window.matchMedia = original;
    }
  });
});
