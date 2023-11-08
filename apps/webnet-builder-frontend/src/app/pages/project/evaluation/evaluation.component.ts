import {Component, ElementRef, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {TrainingRecords} from "../../../core/interfaces/project";
import {MatSelectionList} from "@angular/material/list";
import {MachineLearningService} from "../../../core/services/machine-learning.service";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../../shared/components/message-dialog/message-dialog.component";

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

  constructor(private projectService: ProjectService, private ml: MachineLearningService, private modelBuilderService: ModelBuilderService, private dialog: MatDialog) {
    this.trainingRecords = this.projectService.trainingRecords();
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

  loadTrainingRecord(): void {
    const record = this.selectedRecord;
    if (record && record?.builder, record?.config) {
      this.modelBuilderService.isInitialized = false;
      this.projectService.builder.set(record.builder);
      this.projectService.trainConfig.set(record.config);
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Successfully loaded',
          message: 'Model and its Configuration loaded successfully. You are now able to check out the model in the Modeling-Section or start the Training in the Training-Section.',
          warning: false
        }
      });
    } else {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Loading Failed',
          message: 'The Record is not loaded. This Record seems to be corrupted.',
          warning: true
        },
      });
    }
  }
}
