import {Component, ElementRef, ViewChild} from '@angular/core';
import * as tfvis from "@tensorflow/tfjs-vis";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {TrainingService} from "../../core/services/training.service";
import {TrainStats} from "../../core/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {CustomDialogComponent} from "../../shared/components/custom-dialog/custom-dialog.component";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;
  trainingStats: TrainStats | null = null;
  trainingInProgress: boolean = false;

  constructor(private modelBuilderService: ModelBuilderService, private trainingService: TrainingService, public dialog: MatDialog) {
    this.trainingService.trainingInProgressSubject.subscribe((flag: boolean) => {
      console.log(this.trainingInProgress);
      this.trainingInProgress = flag;
    });
    this.trainingService.trainingStatsSubject.subscribe((stats: TrainStats) => {
      this.trainingStats = stats;
    });
  }

  openDialog(done: {dataset: boolean, model: boolean}) {
    this.dialog.open(CustomDialogComponent, {
      data: {
        tasks: [{
          task: "dataset",
          message: "Load the dataset that you want to use for training.",
          done: done.dataset
        },
          {
            task: "model",
            message: "You need to create a machine learning model for training.",
            done: done.model
          }
        ]
      }
    });
  }

  async showModelSummary(): Promise<void> {
    const model = await this.modelBuilderService.generateModel();
    if (model) {
      // tfvis.show.layer(this.modelSummaryContainer.nativeElement, model.getLayer(1));
      // console.log(model.summary());
      await tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
    }
  }

  async train(): Promise<void> {
    const ready = await this.trainingService.trainingReady();
    if (ready.dataset && ready.model) {
      await this.trainingService.train();
    } else {
      this.openDialog(ready);
    }
  }

  stopTraining(): void {
    this.trainingService.stopTraining();
  }

  async saveModel(): Promise<void> {
    await this.modelBuilderService.saveModel();
  }

  async showAllModels(): Promise<void> {
    await this.modelBuilderService.showAllModels();
  }

  async loadModel(): Promise<void> {
    await this.modelBuilderService.loadModel();
  }

}
