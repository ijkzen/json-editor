import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { JsonNodeType, JsonValue, getJsonNodeType, isContainerType } from '../../lib/json-types';
import { getNumberTags, getStringTags, parseEmail, parseLink, parseTimeFromNumber, parseTimeFromString } from '../../lib/string-tags';
import { JsonStringDialogComponent } from './json-string-dialog.component';

@Component({
  selector: 'app-json-node',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
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
    return getStringTags(this.value as string);
  }

  protected numberTags() {
    if (this.nodeType() !== 'number') return [];
    return getNumberTags(this.value as number);
  }

  protected timeDisplay(): string | null {
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
    if (this.nodeType() !== 'string') return null;
    return parseLink(this.value as string)?.href ?? null;
  }

  protected emailHref(): string | null {
    if (this.nodeType() !== 'string') return null;
    const email = parseEmail(this.value as string)?.address;
    return email ? `mailto:${email}` : null;
  }

  constructor(private readonly dialog: MatDialog) {}

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

  protected trackByChildKey(_index: number, child: { key: string | number; value: JsonValue }): string | number {
    return child.key;
  }

  protected typeClass(): string {
    switch (this.nodeType()) {
      case 'string':
        return 'text-emerald-700';
      case 'number':
        return 'text-sky-700';
      case 'boolean':
        return 'text-purple-700';
      case 'null':
        return 'text-slate-500';
      case 'array':
        return 'text-amber-700';
      case 'object':
        return 'text-cyan-700';
      default:
        return 'text-slate-700';
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
}

function middleEllipsis(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const keep = Math.max(10, Math.floor((maxLen - 1) / 2));
  const head = text.slice(0, keep);
  const tail = text.slice(text.length - keep);
  return `${head}…${tail}`;
}
