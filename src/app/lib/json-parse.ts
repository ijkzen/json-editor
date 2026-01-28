export type JsonParseError = {
  message: string;
  position?: number;
};

export function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: JsonParseError } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const position = extractJsonErrorPosition(message);
    return { ok: false, error: { message, position } };
  }
}

export function extractJsonErrorPosition(message: string): number | undefined {
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildErrorHighlightedHtml(text: string, errorPosition?: number): string {
  const safe = escapeHtml(text);
  if (errorPosition === undefined || !Number.isFinite(errorPosition)) return safe || '&nbsp;';

  const pos = Math.max(0, Math.min(errorPosition, text.length > 0 ? text.length - 1 : 0));

  const before = escapeHtml(text.slice(0, pos));
  const focus = escapeHtml(text.slice(pos, pos + 1) || ' ');
  const after = escapeHtml(text.slice(pos + 1));

  // Keep a minimal, focused highlight; textarea overlay handles the actual editing.
  return (
    (before || '') +
    `<span class="bg-red-500/35 rounded-sm">${focus}</span>` +
    (after || '') ||
    '&nbsp;'
  );
}
