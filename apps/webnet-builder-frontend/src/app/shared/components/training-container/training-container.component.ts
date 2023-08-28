import {Component, Input} from '@angular/core';
import {MnistDataService} from "../../../core/services/mnist-data.service";
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-wasm';
import {Logs} from "@tensorflow/tfjs";
import {ModelWrapperService} from "../../../core/services/model-wrapper.service";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-training-container',
  templateUrl: './training-container.component.html',
  styleUrls: ['./training-container.component.scss']
})
export class TrainingContainerComponent {
  @Input({required: true}) backend!: string;
  @Input({required: true}) trainingExample!: string;
  @Input({required: true}) hyperparameter!: any;

  trainingTime: number = 0;
  trainingInProgress: boolean = false;
  trainingDone: boolean = false;
  stopTrainingFlag: boolean = false;

  stats: {epoch: number, batch: number, loss: number, accuracy: number, progress: number} = {
    epoch: 0, batch: 0, loss: 0, accuracy: 0, progress: 0
  };

  constructor(private mnistDataService: MnistDataService, private modelWrapperService: ModelWrapperService) {
  }

  async train() {
    console.log(this.hyperparameter);
    const {trainXs, trainYs, testXs, testYs} = this.modelWrapperService.prepData(this.trainingExample, this.hyperparameter.batchSize);
    const model = this.modelWrapperService.getModel(this.trainingExample);
    const NumBatchesInEpoch = Math.ceil(trainXs.shape[0]  / this.hyperparameter.batchSize);
    const totalNumBatches = NumBatchesInEpoch * this.hyperparameter.epochs;
    const fitCallback = {
      onTrainBegin: async (logs?: Logs) => {
        // console.log("Training begins...");
        // console.log(logs);
        this.trainingInProgress = true;
      },
      onTrainEnd: async (logs?: Logs) => {
        // console.log("Training ends");
        // console.log(logs);
        this.trainingInProgress = false;
        this.trainingDone = true;
      },
      onEpochBegin: async (epoch: number, logs?: Logs) => {
        // console.log("Epoch begins");
        // console.log(epoch);
        // console.log(logs);
        this.stats.epoch = epoch;
      },
      onEpochEnd: async (epoch: number, logs?: Logs) => {
        // console.log("Epoch ends");
        // console.log(epoch);
        // console.log(logs);
        this.stats.accuracy = logs!['acc'];
        this.stats.loss = logs!['loss'];
      },
      onBatchBegin: async (batch: number, logs?: Logs) => {
        // console.log("Batch begins");
        // console.log(batch);
        // console.log(logs);
        this.stats.batch = batch;
      },
      onBatchEnd: async (batch: number, logs?: Logs) => {
        // console.log("Batch ends");
        // console.log(batch);
        // console.log(logs);
        this.stats.progress = (this.stats.epoch * NumBatchesInEpoch + batch) / totalNumBatches * 100;
        this.stats.accuracy = logs!['acc'];
        this.stats.loss = logs!['loss'];
      },
      onYield: async(epoch: number, batch: number, logs?: Logs) => {
        model.stopTraining = this.stopTrainingFlag;
    }
    }
    const startTime = performance.now();
    const h = await model.fit(trainXs, trainYs, {
        batchSize: this.hyperparameter.batchSize, validationData: [testXs, testYs], epochs: this.hyperparameter.epochs, shuffle: true, callbacks: fitCallback}
    )
    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    return totalTimeInMilliseconds;
  }

  async initBackend(backend: string) {
    await tf.setBackend(backend);
    await tf.ready();
  }

  async startTraining() {
    await this.modelWrapperService.load(this.trainingExample);
    await this.initBackend(this.backend)
    this.trainingTime = await this.train();
  }

  stopTraining() {
    this.stopTrainingFlag = true;
  }
}
