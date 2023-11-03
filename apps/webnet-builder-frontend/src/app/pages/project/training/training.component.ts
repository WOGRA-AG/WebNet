import {Component, ElementRef, ViewChild} from '@angular/core';
import {optimizers} from "../../../shared/tf_objects/optimizers";
import {losses} from "../../../shared/tf_objects/losses";
import {AbstractControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {TrainStats} from "../../../core/interfaces/interfaces";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {TrainingService} from "../../../core/services/training.service";
import {MatDialog} from "@angular/material/dialog";
import {TaskDialogComponent} from "../../../shared/components/task-dialog/task-dialog.component";
import * as tfvis from "@tensorflow/tfjs-vis";
import {ProjectService} from "../../../core/services/project.service";

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent {
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;
  @ViewChild('plotContainer', {static: false}) plotContainer!: ElementRef;
  trainingForm: FormGroup;
  trainingStats: TrainStats | null = null;
  trainingInProgress: boolean = false;
  protected readonly optimizers = optimizers;
  protected readonly losses = losses;

  constructor(private modelBuilderService: ModelBuilderService,
              private trainingService: TrainingService,
              private projectService: ProjectService,
              public dialog: MatDialog,
              fb: NonNullableFormBuilder) {
    this.trainingService.trainingInProgressSubject.subscribe((flag: boolean) => {
      this.trainingInProgress = flag;
      this.updateFormControlState();
    });
    this.trainingService.trainingStatsSubject.subscribe((stats: TrainStats) => {
      this.trainingStats = stats;
    });
    this.trainingForm = fb.group({
      epochs: [100, Validators.required],
      batchSize: [32, Validators.required],
      optimizer: ['adam', Validators.required],
      learningRate: [0.01, Validators.required],
      loss: ['meanSquaredError', Validators.required],
      accuracyPlot: true,
      lossPlot: false,
      shuffle: true,
      validationSplit: 0.2,
    });
  }

  ngOnInit() {
    this.trainingForm.patchValue(this.projectService.trainConfig());
    this.trainingForm.valueChanges.subscribe((formValue) => {
      this.projectService.trainConfig.set(formValue);
    });
  }

  openDialog(done: { dataset: boolean, model: boolean }) {
    this.dialog.open(TaskDialogComponent, {
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
    const model = this.projectService.model();
    if (model) {
      await tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
      this.modelSummaryContainer.nativeElement.querySelector('table').style.margin = "0";
    }
  }

  async train(): Promise<void> {
    const ready = await this.trainingService.trainingReady();
    if (ready.dataset && ready.model) {
      const trainParameter = this.trainingForm.getRawValue();
      trainParameter.optimizer = this.optimizers.get(trainParameter.optimizer)?.function;
      trainParameter.loss = this.losses.get(trainParameter.loss)?.function;
      const dataset = this.projectService.dataset();

      // todo: change mapping
      const X =  dataset.data.map((item) => {
        const values = [];
        for (const column of  dataset.inputColumns) {
          values.push(item[column]);
        }
        return values;
      });

      const Y =  dataset.data.map((item) => {
        const values = [];
        for (const column of  dataset.targetColumns) {
          values.push(item[column]);
        }
        return values;
      }).flat();

      const history = await this.trainingService.train(X, Y, trainParameter, this.plotContainer.nativeElement);
      if (history) {
       console.log(history);
      }
    } else {
      this.openDialog(ready);
    }
  }

  updateFormControlState() {
    const controls = this.trainingForm?.controls;
    for (const controlName in controls) {
      const control: AbstractControl = controls[controlName];
      this.trainingInProgress ? control.disable() : control.enable();
    }
  }

  stopTraining(): void {
    this.trainingService.stopTraining();
  }
}
