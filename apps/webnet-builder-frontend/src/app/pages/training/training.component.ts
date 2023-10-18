import {Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild} from '@angular/core';
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";
import {AbstractControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {TrainStats} from "../../core/interfaces";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {TrainingService} from "../../core/services/training.service";
import {MatDialog} from "@angular/material/dialog";
import {TaskDialogComponent} from "../../shared/components/task-dialog/task-dialog.component";
import * as tfvis from "@tensorflow/tfjs-vis";

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss']
})
export class TrainingComponent {
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;
  @ViewChild('plotContainer', {static: false}) plotContainer!: ElementRef;
  @Input()  trainingConfiguration!: { optimizer: Function, learningRate: number, loss: Function, accuracyPlot: boolean, lossPlot: boolean };
  @Output() trainingConfigurationChange = new EventEmitter<{ optimizer: Function, learningRate: number, loss: Function, accuracyPlot: boolean, lossPlot: boolean }>();
  trainingForm: FormGroup;
  trainingStats: TrainStats | null = null;
  trainingInProgress: boolean = false;
  protected readonly optimizers = optimizers;
  protected readonly losses = losses;

  constructor(private modelBuilderService: ModelBuilderService,
              private trainingService: TrainingService,
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
      optimizer: [optimizers.adam.function, Validators.required],
      learningRate: [0.01, Validators.required],
      loss: [losses.meanSquaredError.function, Validators.required],
      accuracyPlot: true,
      lossPlot: false,
    });
  }
  ngOnInit() {
    if (this.trainingConfiguration) {
      this.trainingForm.patchValue(this.trainingConfiguration);
    }

    this.trainingForm.valueChanges.subscribe((formValue) => {
      this.trainingConfigurationChange.emit(formValue);
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
    const model = await this.modelBuilderService.generateModel();
    if (model) {
      await tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
      this.modelSummaryContainer.nativeElement.querySelector('table').style.margin = "0";
    }
  }

  async train(): Promise<void> {
    const ready = await this.trainingService.trainingReady();
    if (ready.dataset && ready.model) {
      const trainParameter = this.trainingForm.getRawValue();
      await this.trainingService.train(trainParameter, this.plotContainer.nativeElement);
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
