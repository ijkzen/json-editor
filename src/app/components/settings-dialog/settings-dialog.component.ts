import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RecognitionSettingsService } from '../../lib/recognition-settings.service';
import { ThemeSettingsService } from '../../lib/theme-settings.service';

@Component({
  selector: 'app-settings-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
  ],
  templateUrl: './settings-dialog.component.html',
  styles: [
    `
      :host ::ng-deep .settings-color-format .mat-button-toggle-label-content {
        line-height: 32px;
        padding-top: 0;
        padding-bottom: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsDialogComponent {
  constructor(
    protected readonly settings: RecognitionSettingsService,
    protected readonly themeSettings: ThemeSettingsService,
  ) {}
}
