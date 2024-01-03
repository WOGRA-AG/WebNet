import {Component, Input} from '@angular/core';
import {TrainingStats} from "../../../core/interfaces/interfaces";

@Component({
  selector: 'app-training-container',
  templateUrl: './training-container.component.html',
  styleUrls: ['./training-container.component.scss']
})
export class TrainingContainerComponent {
  @Input({required: true}) stats!: TrainingStats;
  @Input({required: true}) historyIndex!: number;
}
