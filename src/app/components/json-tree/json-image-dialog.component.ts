import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export type JsonImageDialogData = {
  title?: string;
  dataUrl: string;
};

@Component({
  selector: 'app-json-image-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || '图片' }}</h2>
    <mat-dialog-content>
      <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2">
        <img
          class="block max-w-full max-h-[70vh] mx-auto object-contain"
          [src]="safeUrl"
          alt="image preview" />
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">关闭</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonImageDialogComponent {
  readonly safeUrl: SafeUrl;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: JsonImageDialogData,
    sanitizer: DomSanitizer
  ) {
    this.safeUrl = sanitizer.bypassSecurityTrustUrl(data.dataUrl);
  }
}
