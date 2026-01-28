import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { JsonNodeType, JsonValue, getJsonNodeType, isContainerType } from '../../lib/json-types';
import { RecognitionSettingsService } from '../../lib/recognition-settings.service';
import {
  ParsedBase64Image,
  StringTag,
  getNumberTags,
  getStringTags,
  parseBase64Image,
  parseEmail,
  parseLink,
  parseTimeFromNumber,
  parseTimeFromString,
} from '../../lib/string-tags';
import { JsonImageDialogComponent } from './json-image-dialog.component';
import { JsonStringDialogComponent } from './json-string-dialog.component';

@Component({
  selector: 'app-json-node',
  imports: [MatIconModule, MatDialogModule],
  templateUrl: './json-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonNodeComponent implements OnInit {
  @Input() nodeKey: string | number | null = null;
  @Input({ required: true }) value!: JsonValue;
  @Input() depth = 0;

  protected readonly expanded = signal(false);

  protected nodeType(): JsonNodeType {
    return getJsonNodeType(this.value);
  }

  protected isContainer(): boolean {
    return isContainerType(this.nodeType());
  }

  protected containerSummary(): string {
    const t = this.nodeType();
    if (t === 'array') return `array(${(this.value as unknown[]).length})`;
    if (t === 'object') return `object(${Object.keys(this.value as Record<string, unknown>).length})`;
    return '';
  }

  protected children(): Array<{ key: string | number; value: JsonValue }> {
    const t = this.nodeType();
    if (t === 'array') {
      return (this.value as JsonValue[]).map((v, i) => ({ key: i, value: v }));
    }
    if (t === 'object') {
      return Object.entries(this.value as Record<string, JsonValue>).map(([k, v]) => ({ key: k, value: v }));
    }
    return [];
  }

  protected stringTags() {
    if (this.nodeType() !== 'string') return [];
    const tags = getStringTags(this.value as string).filter((t) => this.settings.isEnabled(t.kind));
    return this.pickPrimaryTags(tags);
  }

  protected numberTags() {
    if (this.nodeType() !== 'number') return [];
    const tags = getNumberTags(this.value as number).filter((t) => this.settings.isEnabled(t.kind));
    return this.pickPrimaryTags(tags);
  }

  private pickPrimaryTags(tags: StringTag[]): StringTag[] {
    if (!tags.length) return [];

    const priority: Array<StringTag['kind']> = ['image', 'time', 'color', 'phone', 'link', 'email'];
    for (const kind of priority) {
      const hit = tags.find((t) => t.kind === kind);
      if (hit) return [hit];
    }

    // Fallback: preserve existing order.
    return [tags[0]];
  }

  protected colorCss(tag: Extract<StringTag, { kind: 'color' }>): string {
    const raw = tag.raw;

    // 8-digit hex is ambiguous; interpret based on user setting.
    if (/^#[0-9a-fA-F]{8}$/.test(raw)) {
      const rgba =
        this.settings.colorFormat() === 'rgba'
          ? this.parseHex8Rrggbbaa(raw)
          : this.parseHex8Aarrggbb(raw);
      return this.toRgbaString(rgba);
    }

    // For other formats, just use the parsed RGBA.
    return this.toRgbaString(tag.rgba);
  }

  protected timeDisplay(): string | null {
    if (!this.settings.time()) return null;
    if (!this.settings.timeShowFormatted()) return null;
    const t = this.nodeType();
    if (t === 'number') {
      const parsed = parseTimeFromNumber(this.value as number);
      return parsed?.display ?? null;
    }
    if (t === 'string') {
      const parsed = parseTimeFromString(this.value as string);
      return parsed?.display ?? null;
    }
    return null;
  }

  protected linkHref(): string | null {
    if (!this.settings.link()) return null;
    if (this.nodeType() !== 'string') return null;
    return parseLink(this.value as string)?.href ?? null;
  }

  protected emailHref(): string | null {
    if (!this.settings.email()) return null;
    if (this.nodeType() !== 'string') return null;
    const email = parseEmail(this.value as string)?.address;
    return email ? `mailto:${email}` : null;
  }

  constructor(
    private readonly dialog: MatDialog,
    private readonly settings: RecognitionSettingsService
  ) {}

  private toRgbaString(rgba: { r: number; g: number; b: number; a: number }): string {
    const a = Number(rgba.a.toFixed(3));
    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${a})`;
  }

  private toRgbaHexString(rgba: { r: number; g: number; b: number; a: number }): string {
    // CSS hex with alpha is #RRGGBBAA
    const a = clampByte(Math.round(rgba.a * 255));
    return `#${toHex2(rgba.r)}${toHex2(rgba.g)}${toHex2(rgba.b)}${toHex2(a)}`.toUpperCase();
  }

  ngOnInit(): void {
    // Default: only expand the very first layer (root).
    if (this.isContainer()) {
      this.expanded.set(this.depth === 0);
    }
  }

  protected toggle(): void {
    if (!this.isContainer()) return;
    this.expanded.set(!this.expanded());
  }

  protected typeClass(): string {
    switch (this.nodeType()) {
      case 'string':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'number':
        return 'text-sky-700 dark:text-sky-300';
      case 'boolean':
        return 'text-purple-700 dark:text-purple-300';
      case 'null':
        return 'text-slate-500 dark:text-slate-400';
      case 'array':
        return 'text-amber-700 dark:text-amber-300';
      case 'object':
        return 'text-cyan-700 dark:text-cyan-300';
      default:
        return 'text-slate-700 dark:text-slate-200';
    }
  }

  protected formatPrimitive(): string {
    const t = this.nodeType();
    if (t === 'string') return JSON.stringify(this.value);
    if (t === 'null') return 'null';
    return String(this.value);
  }

  protected isLongString(): boolean {
    if (this.nodeType() !== 'string') return false;
    const raw = this.value as string;
    return raw.length > 80;
  }

  protected displayString(): string {
    if (this.nodeType() !== 'string') return this.formatPrimitive();
    const raw = JSON.stringify(this.value as string);
    return middleEllipsis(raw, 100);
  }

  private imageCache: { value: string; info: ParsedBase64Image | null } | null = null;

  protected imageInfo(): ParsedBase64Image | null {
    if (!this.settings.image()) return null;
    if (this.nodeType() !== 'string') return null;

    const raw = this.value as string;
    if (this.imageCache?.value === raw) return this.imageCache.info;

    const info = parseBase64Image(raw);
    this.imageCache = { value: raw, info };
    return info;
  }

  protected displayImageString(): string {
    if (this.nodeType() !== 'string') return this.formatPrimitive();
    const raw = (this.value as string).trim();
    return middleEllipsis(raw, 70);
  }

  protected openImagePreview(info: ParsedBase64Image): void {
    if (!info) return;

    this.dialog.open(JsonImageDialogComponent, {
      data: {
        title: typeof this.nodeKey === 'string' ? this.nodeKey : '图片',
        dataUrl: info.dataUrl,
      },
      maxWidth: 'min(1000px, 95vw)',
      width: 'min(1000px, 95vw)',
    });
  }

  protected openBase64Text(): void {
    if (this.nodeType() !== 'string') return;

    this.dialog.open(JsonStringDialogComponent, {
      data: {
        title: typeof this.nodeKey === 'string' ? this.nodeKey : '内容',
        value: this.value as string,
      },
      maxWidth: 'min(900px, 95vw)',
      width: 'min(900px, 95vw)',
    });
  }

  protected openFullString(): void {
    if (this.nodeType() !== 'string') return;
    if (!this.isLongString()) return;

    this.dialog.open(JsonStringDialogComponent, {
      data: {
        title: typeof this.nodeKey === 'string' ? this.nodeKey : '内容',
        value: this.value as string,
      },
      maxWidth: 'min(900px, 95vw)',
      width: 'min(900px, 95vw)',
    });
  }

  private parseHex8Rrggbbaa(hex: string): { r: number; g: number; b: number; a: number } {
    const raw = hex.replace('#', '');
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = parseInt(raw.slice(6, 8), 16) / 255;
    return { r, g, b, a: Math.min(1, Math.max(0, a)) };
  }

  private parseHex8Aarrggbb(hex: string): { r: number; g: number; b: number; a: number } {
    const raw = hex.replace('#', '');
    const a = parseInt(raw.slice(0, 2), 16) / 255;
    const r = parseInt(raw.slice(2, 4), 16);
    const g = parseInt(raw.slice(4, 6), 16);
    const b = parseInt(raw.slice(6, 8), 16);
    return { r, g, b, a: Math.min(1, Math.max(0, a)) };
  }
}

function toHex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0');
}

function clampByte(n: number): number {
  return Math.min(255, Math.max(0, n));
}

function middleEllipsis(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const keep = Math.max(10, Math.floor((maxLen - 1) / 2));
  const head = text.slice(0, keep);
  const tail = text.slice(text.length - keep);
  return `${head}…${tail}`;
}
