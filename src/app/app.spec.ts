import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    if (typeof localStorage?.clear === 'function') {
      localStorage.clear();
    }
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('JSON Editor');
  });

  it('should restore saved valid json text from localStorage', () => {
    if (typeof localStorage?.setItem !== 'function') return;
    localStorage.setItem('json-editor:saved-json-text:v1', '{\n  "a": 1\n}');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;
    expect(app.jsonText()).toContain('"a": 1');
    expect(app.parseError()).toBeNull();
    expect(app.lastValidValue().a).toBe(1);
  });

  it('should ignore invalid saved json text and fall back', () => {
    if (typeof localStorage?.setItem !== 'function') return;
    localStorage.setItem('json-editor:saved-json-text:v1', '{');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as any;
    expect(app.parseError()).toBeNull();
    expect(app.lastValidValue().user).toBeTruthy();
  });
});
