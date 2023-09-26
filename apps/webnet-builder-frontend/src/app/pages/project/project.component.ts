import {Component, ElementRef, ViewChild} from '@angular/core';
import * as tfvis from "@tensorflow/tfjs-vis";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {TrainingService} from "../../core/services/training.service";
import {TrainStats} from "../../core/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {CustomDialogComponent} from "../../shared/components/custom-dialog/custom-dialog.component";
import {FormControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;
  protected readonly optimizers = optimizers;
  protected readonly losses = losses;
  trainingForm : FormGroup;
  trainingStats: TrainStats | null = null;
  trainingInProgress: boolean = false;
  constructor(private modelBuilderService: ModelBuilderService, private trainingService: TrainingService, public dialog: MatDialog, fb: NonNullableFormBuilder) {
    this.trainingService.trainingInProgressSubject.subscribe((flag: boolean) => {
      console.log(this.trainingInProgress);
      this.trainingInProgress = flag;
    });
    this.trainingService.trainingStatsSubject.subscribe((stats: TrainStats) => {
      this.trainingStats = stats;
    });

    this.trainingForm = fb.group({
      optimizer: new FormControl(optimizers[0].function, Validators.required),
      learningRate: new FormControl(0.01, Validators.required),
      loss: new FormControl(losses[0].function, Validators.required),
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
      const trainParameter = this.trainingForm.getRawValue();
      await this.trainingService.train(trainParameter);
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
