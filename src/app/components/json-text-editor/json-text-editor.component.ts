import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { I18nService } from '../../lib/i18n.service';
import { buildErrorHighlightedHtml } from '../../lib/json-parse';

export type JsonEditorError = {
  message: string;
  position?: number;
};

@Component({
  selector: 'app-json-text-editor',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './json-text-editor.component.html',
  styleUrls: ['./json-text-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonTextEditorComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) text = '';
  @Input() error: JsonEditorError | null = null;

  @Output() textChange = new EventEmitter<string>();
  @Output() format = new EventEmitter<void>();

  @ViewChild('textarea', { static: true }) textareaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('highlight', { static: true }) highlightRef!: ElementRef<HTMLElement>;

  protected highlightedHtml: SafeHtml = '' as unknown as SafeHtml;

  protected readonly t: I18nService['t'];

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly i18n: I18nService,
  ) {
    this.t = i18n.t;
    this.updateHighlight();
  }

  ngOnChanges(): void {
    this.updateHighlight();
  }

  private updateHighlight(): void {
    const html = buildErrorHighlightedHtml(this.text, this.error?.position);
    this.highlightedHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngAfterViewInit(): void {
    // Ensure overlay scroll starts aligned.
    queueMicrotask(() => this.syncScroll());
  }

  protected onInput(value: string): void {
    this.textChange.emit(value);
  }

  protected syncScroll(): void {
    const textarea = this.textareaRef.nativeElement;
    const highlight = this.highlightRef.nativeElement;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  }
}
