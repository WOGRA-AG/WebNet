import {Component, Input} from '@angular/core';
import {MnistDataService} from "../../../core/services/mnist-data.service";
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-wasm';
import {ModelWrapperService} from "../../../core/services/model-wrapper.service";
import {TrainingStats} from "../../../core/interfaces";

@Component({
  selector: 'app-training-container',
  templateUrl: './training-container.component.html',
  styleUrls: ['./training-container.component.scss']
})
export class TrainingContainerComponent {
  @Input({required: true}) stats!: TrainingStats;
  @Input({required: true}) historyIndex!: number;
}
