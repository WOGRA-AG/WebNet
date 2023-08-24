import {Component} from '@angular/core';
import {Backend, TrainingExample} from "../../core/enums";


@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent {
  backends: string[] = [Backend.WEB_GPU, Backend.WEB_GL, Backend.WEB_ASSEMBLY, Backend.CPU];
  trainingExample: TrainingExample[] = [TrainingExample.MNIST, TrainingExample.TEXT];
}
