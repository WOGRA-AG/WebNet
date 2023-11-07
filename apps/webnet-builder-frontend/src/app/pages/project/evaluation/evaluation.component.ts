import {Component, ElementRef, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {TrainingRecords} from "../../../core/interfaces/project";
import {MatSelectionList} from "@angular/material/list";
import {MachineLearningService} from "../../../core/services/machine-learning.service";

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  @ViewChild('trainingHistoryContainer', {static: false}) trainingHistoryContainer!: ElementRef;
  @ViewChild('trainHistoryList') trainHistoryList: MatSelectionList | undefined;
  selectedRecord: TrainingRecords | null = null;
  trainingRecords: TrainingRecords[];

  constructor(private projectService: ProjectService, private ml: MachineLearningService) {
    this.trainingRecords = this.projectService.trainingRecords();
    console.log(this.trainingRecords);
  }

  async getSelectedHistory() {
    const selectedOption = this.trainHistoryList?.selectedOptions.selected[0];
    if (selectedOption) {
      this.selectedRecord = selectedOption.value;
      if (this.selectedRecord?.history) {
        await this.ml.renderLossPlot(this.trainingHistoryContainer.nativeElement, this.selectedRecord?.history)
      } else {
        this.trainingHistoryContainer.nativeElement.innerHTML = '';
      }
    }
  }

  async ngOnInit() {
    this.predict();
  }

  predict() {
    const dataset = this.projectService.dataset();
    const X = dataset.data.map((item) => {
      const values = [];
      for (const column of dataset.inputColumns) {
        values.push(item[column]);
      }
      return values;
    });

    const Y = dataset.data.map((item) => {
      const values = [];
      for (const column of dataset.targetColumns) {
        values.push(item[column]);
      }
      return values;
    }).flat();
    this.ml.predict(X, Y);
  }
}
