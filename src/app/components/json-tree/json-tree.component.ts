import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonValue } from '../../lib/json-types';
import { JsonNodeComponent } from './json-node.component';

@Component({
  selector: 'app-json-tree',
  imports: [CommonModule, JsonNodeComponent],
  templateUrl: './json-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonTreeComponent {
  @Input({ required: true }) value!: JsonValue;
}
