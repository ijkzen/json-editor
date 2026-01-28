import { Injectable, computed, signal } from '@angular/core';

export type AppLocale = 'en' | 'zh';

const LOCALE_STORAGE_KEY = 'json-editor:locale:v1';

const EN = {
  // App shell
  'app.title': 'JSON Editor',
  'app.settings': 'Settings',
  'app.sample': 'Sample',
  'app.tree': 'Tree view',
  'app.jsonInvalidHint': 'Invalid JSON; showing the last valid result.',
  'app.toggleEditor': 'Toggle editor',
  'app.switchLanguage': 'Switch language',

  // Language names
  'lang.en': 'EN',
  'lang.zh': '中文',

  // Editor
  'editor.format': 'Format',
  'editor.ariaLabel': 'JSON editor',

  // Settings dialog
  'settings.title': 'Settings',
  'settings.subtitle': 'Theme and smart recognition/enhanced rendering in the tree view.',
  'settings.darkMode': 'Dark mode',
  'settings.darkModeHint': 'Toggles the overall theme (saved locally).',

  'settings.phone': 'Phone recognition',
  'settings.phoneHint': 'Detect PHONE tags in numbers/strings.',

  'settings.time': 'Time recognition',
  'settings.timeHint': 'Seconds/ms timestamps and ISO time (displayed as UTC+8).',
  'settings.timeShowFormatted': 'Show formatted time',

  'settings.email': 'Email recognition',
  'settings.emailHint': 'Detect EMAIL tags and enable mailto.',

  'settings.link': 'Link recognition',
  'settings.linkHint': 'Detect URLs and open in a new tab.',

  'settings.image': 'Image recognition',
  'settings.imageHint': 'Detect base64 images and preview in a dialog.',

  'settings.color': 'Color recognition',
  'settings.colorHint': 'Detect color values and show a swatch tag.',
  'settings.colorFormat': 'Color format',

  'settings.note': 'Note: settings are saved locally in your browser.',
  'settings.done': 'Done',

  // JSON node
  'node.expand': 'Expand',
  'node.collapse': 'Collapse',
  'node.base64ImageTitle': 'base64 image',
  'node.show': 'show',
  'node.text': 'text',
  'node.openLink': 'Open link',
  'node.sendEmail': 'Send email',
  'node.viewFullContent': 'View full content',

  // Dialogs
  'dialog.content': 'Content',
  'dialog.image': 'Image',
  'dialog.copy': 'Copy',
  'dialog.close': 'Close',
  'dialog.imageAlt': 'Image preview',

  // Snackbars
  'snackbar.copied': 'Copied to clipboard',
  'snackbar.copyFailed': 'Copy failed; please copy manually.',
} as const;

export type TranslationKey = keyof typeof EN;

const ZH: Record<TranslationKey, string> = {
  // App shell
  'app.title': 'JSON 编辑器',
  'app.settings': '设置',
  'app.sample': '示例',
  'app.tree': '树状结构',
  'app.jsonInvalidHint': 'JSON 无效，右侧展示上一次正确结果',
  'app.toggleEditor': '切换编辑器',
  'app.switchLanguage': '切换语言',

  // Language names
  'lang.en': 'EN',
  'lang.zh': '中文',

  // Editor
  'editor.format': '格式化',
  'editor.ariaLabel': 'JSON 编辑器',

  // Settings dialog
  'settings.title': '设置',
  'settings.subtitle': '主题与树状视图的自动识别/增强展示。',
  'settings.darkMode': '暗色模式',
  'settings.darkModeHint': '切换应用的整体主题（会保存到本地）',

  'settings.phone': '手机号识别',
  'settings.phoneHint': '数字/字符串中识别 PHONE 标签',

  'settings.time': '时间识别',
  'settings.timeHint': '秒/毫秒时间戳、ISO 时间（UTC+8 展示）',
  'settings.timeShowFormatted': '展示格式化时间',

  'settings.email': 'EMAIL 识别',
  'settings.emailHint': '识别 EMAIL 标签并支持 MAILTO',

  'settings.link': 'LINK 识别',
  'settings.linkHint': '识别网址并支持新标签页打开',

  'settings.image': 'IMG 识别',
  'settings.imageHint': '识别 base64 图片并支持弹窗预览',

  'settings.color': 'COLOR 识别',
  'settings.colorHint': '识别颜色值并展示色块标签',
  'settings.colorFormat': '颜色格式',

  'settings.note': '提示：设置会自动保存到本地浏览器。',
  'settings.done': '完成',

  // JSON node
  'node.expand': '展开',
  'node.collapse': '收起',
  'node.base64ImageTitle': 'base64 图片',
  'node.show': '预览',
  'node.text': '文本',
  'node.openLink': '点击打开链接',
  'node.sendEmail': '点击发送邮件',
  'node.viewFullContent': '点击查看完整内容',

  // Dialogs
  'dialog.content': '内容',
  'dialog.image': '图片',
  'dialog.copy': '复制',
  'dialog.close': '关闭',
  'dialog.imageAlt': '图片预览',

  // Snackbars
  'snackbar.copied': '已复制到剪贴板',
  'snackbar.copyFailed': '复制失败，请手动复制',
};

const DICTS = {
  en: EN,
  zh: ZH,
} as const satisfies Record<AppLocale, Record<TranslationKey, string>>;

function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en';

  const raw = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase();
  if (raw.startsWith('zh')) return 'zh';
  return 'en';
}

function loadSavedLocale(): AppLocale | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    if (typeof localStorage.getItem !== 'function') return null;
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw === 'en' || raw === 'zh') return raw;
    return null;
  } catch {
    return null;
  }
}

function saveLocale(locale: AppLocale | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (typeof localStorage.setItem !== 'function') return;
    if (typeof localStorage.removeItem !== 'function') return;
    if (locale) localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    else localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{([\w.-]+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? `{${name}}` : String(value);
  });
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly manualOverrideSignal = signal<AppLocale | null>(loadSavedLocale());
  private readonly localeSignal = signal<AppLocale>(this.manualOverrideSignal() ?? detectBrowserLocale());

  readonly locale = this.localeSignal.asReadonly();
  private readonly dict = computed(() => DICTS[this.localeSignal()]);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('languagechange', () => {
        // Only follow the browser when user hasn't manually chosen a locale.
        if (this.manualOverrideSignal() === null) {
          this.localeSignal.set(detectBrowserLocale());
        }
      });
    }
  }

  setLocale(locale: AppLocale): void {
    this.manualOverrideSignal.set(locale);
    this.localeSignal.set(locale);
    saveLocale(locale);
  }

  clearLocaleOverride(): void {
    this.manualOverrideSignal.set(null);
    saveLocale(null);
    this.localeSignal.set(detectBrowserLocale());
  }

  toggleLocale(): void {
    this.setLocale(this.localeSignal() === 'zh' ? 'en' : 'zh');
  }

  readonly t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const template = this.dict()[key] ?? EN[key] ?? String(key);
    return interpolate(template, params);
  };
}
