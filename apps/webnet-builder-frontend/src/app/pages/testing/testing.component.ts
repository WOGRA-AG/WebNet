import {Component} from '@angular/core';
import {Backend, TrainingExample} from "../../core/enums";
import {FormControl, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent {
  backends: string[] = [Backend.WEB_GPU, Backend.WEB_GL, Backend.WEB_ASSEMBLY, Backend.CPU];
  trainingExample: TrainingExample[] = [TrainingExample.MNIST, TrainingExample.TEXT];
  hyperparameterForm = new FormGroup({
    trainDataSize: new FormControl(5000, Validators.required),
    epochs: new FormControl(10, Validators.required),
    batchSize: new FormControl(500, Validators.required)
  });

}
