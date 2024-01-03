import {Component, ElementRef, ViewChild} from '@angular/core';
import {Backend, TrainingExample} from "../../core/enums";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MnistDataService} from "../../core/services/model-data-services/mnist-data.service";
import {ModelWrapperService} from "../../core/services/model-wrapper.service";
import {TrainingStats} from "../../core/interfaces/interfaces";
import * as tf from "@tensorflow/tfjs";
import * as tfvis from '@tensorflow/tfjs-vis';
import {cloneObject} from "../../shared/utils";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent {
  hyperParameter = new FormGroup({
    example: new FormControl(TrainingExample.MNIST, Validators.required),
    backend: new FormControl(Backend.WEB_GPU, Validators.required),
    // trainDataSize: new FormControl(5000, Validators.required),
    epochs: new FormControl(100, Validators.required),
    batchSize: new FormControl(5000, Validators.required)
  });
  trainingInProgress: boolean = false;
  trainingDone: boolean = false;
  stopTrainingFlag: boolean = false;
  trainingStats: TrainingStats = {
    epoch: 0, batch: 0, loss: 0, accuracy: 0, progress: 0, trainingTime: 0,
    trainingInfo: {
      epochs: 0, example: '', backend: '', batchSize: 0, sampleSize: 0
    }
  };
  trainingHistory: TrainingStats[] = [];
  @ViewChild('modelSummaryContainer', { static: false }) modelSummaryContainer!: ElementRef;
  private backendSubscription: Subscription|undefined;
  constructor(private mnistDataService: MnistDataService, private modelWrapperService: ModelWrapperService) {
    this.backendSubscription = this.hyperParameter?.get('backend')?.valueChanges.subscribe(async (backendValue) => {
      await this.initBackend();
    });
  }

  async ngOnInit(): Promise<void> {

    await this.initBackend()
    const model = this.modelWrapperService.getModel(this.hyperParameter.get('example')?.value!);
    if (model) {
      tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
      const tableElement = this.modelSummaryContainer.nativeElement.querySelector('table');
      if (tableElement) {
        tableElement.style.margin = '0';
      }
    }
  }

  async initBackend(): Promise<void> {
    const backendControl = this.hyperParameter.get('backend');
    if (backendControl) {
      await tf.setBackend(backendControl.value!.toString());
      await tf.ready();
    }
  }

  async startTraining(): Promise<void> {
    await this.modelWrapperService.load(this.hyperParameter.get('example')?.value!);
    this.trainingStats.trainingTime = await this.train();
    this.trainingHistory.push(cloneObject(this.trainingStats));
  }

  stopTraining(): void {
    this.stopTrainingFlag = true;
  }

  async train(): Promise<number> {
    const { example, backend, batchSize, epochs } = this.hyperParameter.value;
    this.trainingStats.trainingInfo.example = example!;
    this.trainingStats.trainingInfo.backend = backend!;
    this.trainingStats.trainingInfo.batchSize = batchSize!;
    this.trainingStats.trainingInfo.epochs = epochs!;
    this.trainingStats.trainingInfo.sampleSize = 55000;

    const {trainXs, trainYs, testXs, testYs} = this.modelWrapperService.prepData(example!, batchSize!)!;
    const model = this.modelWrapperService.getModel(example!);

    const NumBatchesInEpoch = Math.ceil(trainXs.shape[0] / batchSize!);
    const totalNumBatches = NumBatchesInEpoch * epochs!;
    const fitCallback = {
      onTrainBegin: async (logs?: tf.Logs) => {
        this.trainingInProgress = true;
      },
      onTrainEnd: async (logs?: tf.Logs) => {
        this.trainingInProgress = false;
        this.trainingDone = true;
      },
      onEpochBegin: async (epoch: number, logs?: tf.Logs) => {
        this.trainingStats.epoch = epoch;
      },
      onEpochEnd: async (epoch: number, logs?: tf.Logs) => {
        this.trainingStats.accuracy = logs!['acc'];
        this.trainingStats.loss = logs!['loss'];
      },
      onBatchBegin: async (batch: number, logs?: tf.Logs) => {
        this.trainingStats.batch = batch;
      },
      onBatchEnd: async (batch: number, logs?: tf.Logs) => {
        this.trainingStats.progress = (this.trainingStats.epoch * NumBatchesInEpoch + batch) / totalNumBatches * 100;
        this.trainingStats.accuracy = logs!['acc'];
        this.trainingStats.loss = logs!['loss'];
      },
      onYield: async (epoch: number, batch: number, logs?: tf.Logs) => {
        model!.stopTraining = this.stopTrainingFlag;
        this.stopTrainingFlag = false;
      }
    }
    const startTime = performance.now();
    await model?.fit(trainXs, trainYs, {
        batchSize: batchSize!, validationData: [testXs, testYs], epochs: epochs!, shuffle: true, callbacks: fitCallback
      }
    )
    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    console.log("TRAINING TIME: ", totalTimeInMilliseconds);
    return totalTimeInMilliseconds;
  }

}
