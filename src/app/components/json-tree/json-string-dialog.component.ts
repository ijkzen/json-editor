import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export type JsonStringDialogData = {
  title?: string;
  value: string;
};

@Component({
  selector: 'app-json-string-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title || '内容' }}</h2>
    <mat-dialog-content>
      <pre class="whitespace-pre-wrap break-words font-mono text-sm">{{ data.value }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">关闭</button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonStringDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: JsonStringDialogData) {}
}
