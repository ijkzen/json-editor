import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { I18nService } from '../../lib/i18n.service';

export type JsonImageDialogData = {
  title?: string;
  dataUrl: string;
};

@Component({
  selector: 'app-json-image-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || t('dialog.image') }}</h2>
    <mat-dialog-content>
      <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
        <img
          class="block max-w-full max-h-[70vh] mx-auto object-contain"
          [src]="safeUrl"
          [attr.alt]="t('dialog.imageAlt')" />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">{{ t('dialog.close') }}</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonImageDialogComponent {
  readonly safeUrl: SafeUrl;
  protected readonly t: I18nService['t'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: JsonImageDialogData,
    sanitizer: DomSanitizer,
    i18n: I18nService,
  ) {
    this.t = i18n.t;
    this.safeUrl = sanitizer.bypassSecurityTrustUrl(data.dataUrl);
  }
}
