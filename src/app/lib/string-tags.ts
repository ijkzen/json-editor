export type StringTag =
  | { kind: 'phone'; label: 'phone' }
  | { kind: 'color'; label: 'color'; cssColor: string; textColor: string };

export function getStringTags(value: string): StringTag[] {
  const tags: StringTag[] = [];

  if (looksLikePhone(value)) {
    tags.push({ kind: 'phone', label: 'phone' });
  }

  const color = parseCssColor(value);
  if (color) {
    tags.push({ kind: 'color', label: 'color', cssColor: color.cssColor, textColor: color.textColor });
  }

  return tags;
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

type ParsedColor = { cssColor: string; textColor: string };

function parseCssColor(value: string): ParsedColor | null {
  const trimmed = value.trim();

  const hex = parseHex(trimmed);
  if (hex) {
    const rgb = hexToRgb(hex);
    const textColor = rgb ? idealTextColor(rgb.r, rgb.g, rgb.b) : '#000';
    return { cssColor: trimmed, textColor };
  }

  const rgb = parseRgb(trimmed);
  if (rgb) {
    return { cssColor: trimmed, textColor: idealTextColor(rgb.r, rgb.g, rgb.b) };
  }

  const hsl = parseHsl(trimmed);
  if (hsl) {
    const rgb2 = hslToRgb(hsl.h, hsl.s, hsl.l);
    return { cssColor: trimmed, textColor: idealTextColor(rgb2.r, rgb2.g, rgb2.b) };
  }

  return null;
}

function parseHex(value: string): string | null {
  if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value)) return null;
  return value;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.replace('#', '');
  const normalized =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.length === 4
        ? raw
            .slice(0, 3)
            .split('')
            .map((c) => c + c)
            .join('')
        : raw.slice(0, 6);

  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if (![r, g, b].every((n) => Number.isFinite(n))) return null;
  return { r, g, b };
}

function parseRgb(value: string): { r: number; g: number; b: number } | null {
  const match = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if (![r, g, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 255)) return null;

  if (match[4] !== undefined) {
    const a = Number(match[4]);
    if (!(Number.isFinite(a) && a >= 0 && a <= 1)) return null;
  }

  return { r, g, b };
}

function parseHsl(value: string): { h: number; s: number; l: number } | null {
  const match = value.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!match) return null;

  const h = Number(match[1]);
  const s = Number(match[2]);
  const l = Number(match[3]);
  if (![h, s, l].every((n) => Number.isFinite(n))) return null;
  if (s < 0 || s > 100 || l < 0 || l > 100) return null;

  if (match[4] !== undefined) {
    const a = Number(match[4]);
    if (!(Number.isFinite(a) && a >= 0 && a <= 1)) return null;
  }

  return { h: ((h % 360) + 360) % 360, s: s / 100, l: l / 100 };
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
