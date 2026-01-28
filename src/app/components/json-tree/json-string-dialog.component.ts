import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export type JsonStringDialogData = {
  title?: string;
  value: string;
};

@Component({
  selector: 'app-json-string-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSnackBarModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || '内容' }}</h2>
    <mat-dialog-content>
      <pre class="whitespace-pre-wrap break-words font-mono text-sm">{{ data.value }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions class="flex items-center justify-between">
      <button mat-button type="button" (click)="copy()">复制</button>

      <button mat-button mat-dialog-close type="button">关闭</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonStringDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: JsonStringDialogData,
    private readonly snackBar: MatSnackBar,
  ) {}

  async copy(): Promise<void> {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(this.data.value);
      this.snackBar.open('已复制到剪贴板', '关闭', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch {
      this.snackBar.open('复制失败，请手动复制', '关闭', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }
}
