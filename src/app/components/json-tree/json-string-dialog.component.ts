import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { I18nService } from '../../lib/i18n.service';

export type JsonStringDialogData = {
  title?: string;
  value: string;
};

@Component({
  selector: 'app-json-string-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || t('dialog.content') }}</h2>
    <mat-dialog-content>
      <pre class="whitespace-pre-wrap break-words font-mono text-sm">{{ data.value }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions class="flex items-center justify-between">
      <button mat-button type="button" (click)="copy()">{{ t('dialog.copy') }}</button>

      <button mat-button mat-dialog-close type="button">{{ t('dialog.close') }}</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonStringDialogComponent {
  protected readonly t: I18nService['t'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: JsonStringDialogData,
    private readonly snackBar: MatSnackBar,
    i18n: I18nService,
  ) {
    this.t = i18n.t;
  }

  async copy(): Promise<void> {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(this.data.value);
      this.snackBar.open(this.t('snackbar.copied'), this.t('dialog.close'), {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch {
      this.snackBar.open(this.t('snackbar.copyFailed'), this.t('dialog.close'), {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }
}
