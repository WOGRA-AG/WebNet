import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  _dataset: any;
  @Input() set dataset(value: any) {
    if (value && Object.keys(value).length > 0) {
      this._dataset = value;
    } else {
      this._dataset = null;
    }
  }
}
