export type StringTag =
  | { kind: 'phone'; label: 'phone' }
  | { kind: 'time'; label: 'time' }
  | { kind: 'link'; label: 'link' }
  | { kind: 'email'; label: 'email' }
  | {
      kind: 'image';
      label: 'IMG';
      mime: string;
      dataUrl: string;
    }
  | {
      kind: 'color';
      label: 'color';
      raw: string;
      cssColor: string;
      textColor: string;
      rgba: { r: number; g: number; b: number; a: number };
    };

export function getStringTags(value: string): StringTag[] {
  const tags: StringTag[] = [];

  const img = parseBase64Image(value);
  if (img) {
    tags.push({ kind: 'image', label: 'IMG', mime: img.mime, dataUrl: img.dataUrl });
  }

  if (looksLikePhone(value)) {
    tags.push({ kind: 'phone', label: 'phone' });
  }

  if (parseTimeFromString(value)) {
    tags.push({ kind: 'time', label: 'time' });
  }

  if (parseEmail(value)) {
    tags.push({ kind: 'email', label: 'email' });
  }

  if (parseLink(value)) {
    tags.push({ kind: 'link', label: 'link' });
  }

  const color = parseCssColor(value);
  if (color) {
    tags.push({ kind: 'color', label: 'color', raw: color.raw, cssColor: color.cssColor, textColor: color.textColor, rgba: color.rgba });
  }

  return tags;
}

export type ParsedBase64Image = {
  mime: string;
  dataUrl: string;
};

export function parseBase64Image(value: string): ParsedBase64Image | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Data URL: data:image/<type>;base64,<payload>
  const dataUrlMatch = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(trimmed);
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1];
    const payload = dataUrlMatch[2].replace(/\s+/g, '');
    if (!looksLikeBase64Payload(payload)) return null;
    return { mime, dataUrl: `data:${mime};base64,${payload}` };
  }

  // Raw base64 (no prefix). Heuristics based on common magic headers.
  const raw = trimmed.replace(/\s+/g, '');
  if (!looksLikeBase64Payload(raw)) return null;

  const mime = guessImageMimeFromBase64Prefix(raw);
  if (!mime) return null;
  return { mime, dataUrl: `data:${mime};base64,${raw}` };
}

function looksLikeBase64Payload(payload: string): boolean {
  // Avoid false positives: too short and/or not base64-ish.
  if (payload.length < 64) return false;
  if (payload.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]+={0,2}$/.test(payload);
}

function guessImageMimeFromBase64Prefix(payload: string): string | null {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (payload.startsWith('iVBORw0KGgo')) return 'image/png';
  // JPEG: FF D8 FF
  if (payload.startsWith('/9j/')) return 'image/jpeg';
  // GIF: GIF87a / GIF89a
  if (payload.startsWith('R0lGOD')) return 'image/gif';
  // WEBP: RIFF....WEBP
  if (payload.startsWith('UklGR')) return 'image/webp';
  // BMP: BM
  if (payload.startsWith('Qk')) return 'image/bmp';
  // ICO: 00 00 01 00
  if (payload.startsWith('AAABAA')) return 'image/x-icon';
  return null;
}

export function getNumberTags(value: number): StringTag[] {
  const tags: StringTag[] = [];

  if (looksLikePhoneNumber(value)) {
    tags.push({ kind: 'phone', label: 'phone' });
  }

  if (parseTimeFromNumber(value)) {
    tags.push({ kind: 'time', label: 'time' });
  }

  return tags;
}

export type ParsedTime =
  | { kind: 'timestamp'; date: Date; display: string }
  | { kind: 'iso'; date: Date; display: string };

const ASIA_SHANGHAI_TZ = 'Asia/Shanghai';

export function parseTimeFromNumber(value: number): ParsedTime | null {
  if (!Number.isFinite(value)) return null;
  if (!Number.isInteger(value)) return null;

  // Reasonable range: 2000-01-01 to 2100-01-01
  const SEC_MIN = 946684800;
  const SEC_MAX = 4102444800;
  const MS_MIN = SEC_MIN * 1000;
  const MS_MAX = SEC_MAX * 1000;

  let ms: number | null = null;
  if (value >= SEC_MIN && value <= SEC_MAX) {
    ms = value * 1000;
  } else if (value >= MS_MIN && value <= MS_MAX) {
    ms = value;
  }
  if (ms === null) return null;

  const date = new Date(ms);
  if (!Number.isFinite(date.getTime())) return null;
  return { kind: 'timestamp', date, display: formatSlashDateTime(date, ASIA_SHANGHAI_TZ) };
}

export function parseTimeFromString(value: string): ParsedTime | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const numeric = parseNumericTimestamp(trimmed);
  if (numeric !== null) {
    const parsed = parseTimeFromNumber(numeric);
    if (parsed) return parsed;
  }

  if (looksLikeIso8601(trimmed)) {
    const t = Date.parse(trimmed);
    if (Number.isFinite(t)) {
      const date = new Date(t);
      return { kind: 'iso', date, display: `UTC+8 ${formatDashDateTime(date, ASIA_SHANGHAI_TZ)}` };
    }
  }

  return null;
}

export function parseLink(value: string): { href: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(candidate)) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return { href: url.toString() };
  } catch {
    return null;
  }
}

export function parseEmail(value: string): { address: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Pragmatic email regex (good enough for UI tagging).
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed)) return null;
  return { address: trimmed };
}

function looksLikePhone(value: string): boolean {
  const trimmed = value.trim();
  // China mobile (common): 11 digits starting with 1[3-9]
  if (/^1[3-9]\d{9}$/.test(trimmed)) return true;

  // Generic: +country and 7-15 digits total (ignoring separators)
  const digits = trimmed.replace(/[\s\-()]/g, '');
  if (!/^\+?\d+$/.test(digits)) return false;

  const digitCount = digits.startsWith('+') ? digits.length - 1 : digits.length;
  return digitCount >= 7 && digitCount <= 15;
}

function looksLikePhoneNumber(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (!Number.isInteger(value)) return false;
  if (value < 0) return false;

  const raw = String(value);
  // Avoid scientific notation.
  if (raw.includes('e') || raw.includes('E')) return false;
  return looksLikePhone(raw);
}

function parseNumericTimestamp(value: string): number | null {
  // Allow 10-13 digit integers.
  if (!/^\d{10,13}$/.test(value)) return null;

  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isSafeInteger(n)) return null;

  // If it's 10 digits, treat as seconds; if 13 digits, treat as ms.
  if (value.length === 10) return n; // seconds
  if (value.length === 13) return n; // ms

  // 11-12 digits: decide by range.
  return n;
}

function looksLikeIso8601(value: string): boolean {
  // Require a clear ISO shape to reduce false positives.
  // Examples: 2026-01-29T07:30:45.333Z, 2026-01-29T15:30:45+08:00
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
}

function formatSlashDateTime(date: Date, timeZone: string): string {
  const p = getDateTimeParts(date, timeZone);
  return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}:${p.second}.${p.millisecond}`;
}

function formatDashDateTime(date: Date, timeZone: string): string {
  const p = getDateTimeParts(date, timeZone);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}.${p.millisecond}`;
}

function getDateTimeParts(
  date: Date,
  timeZone: string
): { year: string; month: string; day: string; hour: string; minute: string; second: string; millisecond: string } {
  const base = {
    year: '',
    month: '',
    day: '',
    hour: '',
    minute: '',
    second: '',
    millisecond: String(date.getMilliseconds()).padStart(3, '0'),
  };

  try {
    const dtf = new Intl.DateTimeFormat('zh-CN', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      fractionalSecondDigits: 3,
    } as Intl.DateTimeFormatOptions);

    for (const part of dtf.formatToParts(date)) {
      if (part.type === 'year') base.year = part.value;
      else if (part.type === 'month') base.month = part.value;
      else if (part.type === 'day') base.day = part.value;
      else if (part.type === 'hour') base.hour = part.value;
      else if (part.type === 'minute') base.minute = part.value;
      else if (part.type === 'second') base.second = part.value;
      else if (part.type === 'fractionalSecond') base.millisecond = part.value.padStart(3, '0');
    }

    if (base.year && base.month && base.day && base.hour && base.minute && base.second) {
      return base;
    }
  } catch {
    // Fall through to a simple (best-effort) fallback.
  }

  // Fallback (timezone may differ); still keeps milliseconds correct.
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return {
    year: String(date.getFullYear()),
    month: pad2(date.getMonth() + 1),
    day: pad2(date.getDate()),
    hour: pad2(date.getHours()),
    minute: pad2(date.getMinutes()),
    second: pad2(date.getSeconds()),
    millisecond: String(date.getMilliseconds()).padStart(3, '0'),
  };
}

type ParsedColor = { cssColor: string; textColor: string };

type Rgba = { r: number; g: number; b: number; a: number };

function parseCssColor(value: string): (ParsedColor & { rgba: Rgba; raw: string }) | null {
  const trimmed = value.trim();

  const argb = parseArgbHex(trimmed);
  if (argb) {
    return { raw: trimmed, cssColor: rgbaToCss(argb), textColor: idealTextColor(argb.r, argb.g, argb.b), rgba: argb };
  }

  const hex = parseHex(trimmed);
  if (hex) {
    const rgba = hexToRgba(hex);
    const textColor = rgba ? idealTextColor(rgba.r, rgba.g, rgba.b) : '#000';
    if (!rgba) return null;
    return { raw: trimmed, cssColor: rgbaToCss(rgba), textColor, rgba };
  }

  const rgb = parseRgb(trimmed);
  if (rgb) {
    return { raw: trimmed, cssColor: rgbaToCss(rgb), textColor: idealTextColor(rgb.r, rgb.g, rgb.b), rgba: rgb };
  }

  const hsl = parseHsl(trimmed);
  if (hsl) {
    const rgb2 = hslToRgb(hsl.h, hsl.s, hsl.l);
    const rgba: Rgba = { ...rgb2, a: hsl.a };
    return { raw: trimmed, cssColor: rgbaToCss(rgba), textColor: idealTextColor(rgb2.r, rgb2.g, rgb2.b), rgba };
  }

  return null;
}

function parseHex(value: string): string | null {
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) return null;
  return value;
}

function parseArgbHex(value: string): Rgba | null {
  // Unambiguous ARGB: 0xAARRGGBB (common in Android/Flutter etc.)
  const match = value.match(/^(?:0x|0X)([0-9a-fA-F]{8})$/);
  if (!match) return null;
  const raw = match[1];
  const a = parseInt(raw.slice(0, 2), 16) / 255;
  const r = parseInt(raw.slice(2, 4), 16);
  const g = parseInt(raw.slice(4, 6), 16);
  const b = parseInt(raw.slice(6, 8), 16);
  if (![r, g, b, a].every((n) => Number.isFinite(n))) return null;
  return { r, g, b, a: clamp01(a) };
}

function hexToRgba(hex: string): Rgba | null {
  const raw = hex.replace('#', '');

  if (raw.length === 3 || raw.length === 4) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    const a = raw.length === 4 ? parseInt(raw[3] + raw[3], 16) / 255 : 1;
    if (![r, g, b, a].every((n) => Number.isFinite(n))) return null;
    return { r, g, b, a: clamp01(a) };
  }

  if (raw.length === 6 || raw.length === 8) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
    if (![r, g, b, a].every((n) => Number.isFinite(n))) return null;
    return { r, g, b, a: clamp01(a) };
  }

  return null;
}

function parseRgb(value: string): Rgba | null {
  const match = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if (![r, g, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 255)) return null;

  if (match[4] !== undefined) {
    const a = Number(match[4]);
    if (!(Number.isFinite(a) && a >= 0 && a <= 1)) return null;
    return { r, g, b, a: clamp01(a) };
  }

  return { r, g, b, a: 1 };
}

function parseHsl(value: string): { h: number; s: number; l: number; a: number } | null {
  const match = value.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;

  const h = Number(match[1]);
  const s = Number(match[2]);
  const l = Number(match[3]);
  if (![h, s, l].every((n) => Number.isFinite(n))) return null;
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;

  let a = 1;
  if (match[4] !== undefined) {
    a = Number(match[4]);
    if (!(Number.isFinite(a) && a >= 0 && a <= 1)) return null;
  }

  return { h: ((h % 360) + 360) % 360, s: s / 100, l: l / 100, a: clamp01(a) };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);

  return { r, g, b };
}

function idealTextColor(r: number, g: number, b: number): string {
  // Relative luminance (sRGB), quick heuristic.
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.5 ? '#ffffff' : '#111827'; // white / slate-900
}

function rgbaToCss(rgba: Rgba): string {
  const a = Number(rgba.a.toFixed(3));
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a})`;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}
