import {Component, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-dynamic-layer-form',
  templateUrl: './dynamic-layer-form.component.html',
  styleUrls: ['./dynamic-layer-form.component.scss']
})
export class DynamicLayerFormComponent {
  @Input() parameterConfig!: Parameter[];
  @Input() form!: FormGroup;
}

export interface Parameter {
  key: string
  label: string
  controlType: string
  value: string
  required: boolean
  type: string
}
