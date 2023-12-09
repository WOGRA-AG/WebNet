import {Component, ElementRef, ViewChild} from '@angular/core';
import {optimizers} from "../../../shared/ml_objects/optimizers";
import {losses} from "../../../shared/ml_objects/losses";
import {tfBackends} from "../../../shared/ml_objects/tfBackends";
import {AbstractControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {TrainStats} from "../../../core/interfaces/interfaces";
import {MachineLearningService} from "../../../core/services/machine-learning.service";
import {MatDialog} from "@angular/material/dialog";
import {TaskDialogComponent} from "../../../shared/components/task-dialog/task-dialog.component";
import * as tfvis from "@tensorflow/tfjs-vis";
import {ProjectService} from "../../../core/services/project.service";
import {MessageDialogComponent} from "../../../shared/components/message-dialog/message-dialog.component";

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
  protected readonly tfBackends = tfBackends;

  constructor(private ml: MachineLearningService,
              private projectService: ProjectService,
              public dialog: MatDialog,
              fb: NonNullableFormBuilder) {
    this.ml.trainingInProgressSubject.subscribe((flag: boolean) => {
      this.trainingInProgress = flag;
      this.updateFormControlState();
    });
    this.ml.trainingStatsSubject.subscribe((stats: TrainStats) => {
      this.trainingStats = stats;
    });
    this.trainingForm = fb.group({
      epochs: [10, Validators.required],
      batchSize: [32, Validators.required],
      optimizer: ['sgd', Validators.required],
      learningRate: [0.1, Validators.required],
      loss: ['meanSquaredError', Validators.required],
      tfBackend: ['webgpu', Validators.required],
      accuracyPlot: false,
      lossPlot: false,
      shuffle: true,
      earlyStopping: false,
      saveTraining: true,
      useExistingWeights: false,
      validationSplit: 0.2,
    });
  }

  ngOnInit() {
    this.trainingForm.patchValue(this.projectService.trainConfig());
    this.trainingForm.valueChanges.subscribe((formValue) => {
      this.projectService.trainConfig.set(formValue);
    });
  }

  async ngAfterViewInit() {
    // todo: does not always work when changing model in builder and directly switching to training page, due to time constraints
    await this.showModelSummary();
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

  mapHistoryRecord(history: number[]): { x: number, y: number }[] {
    return history.map((value: number, epoch: number) => ({x: epoch, y: value}));
  }

  async train(): Promise<void> {
    const ready = await this.ml.trainingReady();
    if (ready.dataset && ready.model) {
      const backend = this.trainingForm.get('tfBackend')?.value;
      const backendSelected = await this.ml.setTfBackend(backend);
      if (backendSelected) {
        const df = await this.projectService.dataframe();
        const [X, Y] = await this.ml.extractFeaturesAndTargets(df);

        const reshapedX = this.ml.reshapeTensors(X);
        const reshapedY = Y;

        if (reshapedX) {
          const history = await this.ml.train(reshapedX, reshapedY, this.plotContainer.nativeElement);
          this.ml.updateWeights();

          if (this.trainingForm.get('saveTraining')?.value && this.trainingStats && history) {
            const val_loss = this.mapHistoryRecord(history.history['val_loss']);
            const loss = this.mapHistoryRecord(history.history['loss']).splice(0, val_loss.length);
            const val_acc = this.mapHistoryRecord(history.history['val_acc']);
            const acc = this.mapHistoryRecord(history.history['acc']).splice(0, val_acc.length);

            this.trainingStats.loss = history.history['val_loss'][val_loss.length - 1];
            this.trainingStats.accuracy = history.history['val_acc'][val_loss.length - 1];
            this.projectService.addTrainingRecord(this.trainingStats, {
              loss: loss,
              val_loss: val_loss,
              acc: acc,
              val_acc: val_acc
            });
          }
        } else {
          this.dialog.open(MessageDialogComponent, {
            maxWidth: '600px',
            data: {
              title: 'Reshaping Failed',
              message: 'Please ensure that the shape of your InputLayer matches the number of features (columns) in your dataset, including any additional columns introduced, such as those from one-hot encoding.',
              warning: true
            }
          });
        }
      } else {
        this.dialog.open(MessageDialogComponent, {
          maxWidth: '600px',
          data: {
            title: 'Backend not supported',
            message: `The ${tfBackends.get(backend)?.name} Backend you selected is not supported by your browser.`,
            warning: true
          },
        });
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
    this.ml.stopTraining();
  }
}
