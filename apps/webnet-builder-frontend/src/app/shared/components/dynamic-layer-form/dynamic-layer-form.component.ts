import {Component, Input} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-dynamic-layer-form',
  templateUrl: './dynamic-layer-form.component.html',
  styleUrls: ['./dynamic-layer-form.component.scss']
})
export class DynamicLayerFormComponent {
  @Input() parameterConfig!: Parameter[];
  @Input() form!: FormGroup;
  private subscriptions: Subscription[] = [];

  ngOnChanges(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.parameterConfig
      .filter((parameter) => parameter.type === 'number')
      .forEach((parameter) => {
        console.log(parameter);
        const sub = this.form.get(parameter.key)?.valueChanges.subscribe((value) => {
          const intValue = parseInt(value, 10);
          if (!isNaN(intValue)) {
            this.form.get(parameter.key)?.setValue(intValue, { emitEvent: false });
          }
        });
        this.subscriptions.push(sub!);
      });
  }
}

export interface Parameter {
  key: string
  label: string
  controlType: string
  type: string,
  options: any[],
  tooltip?: string
}
