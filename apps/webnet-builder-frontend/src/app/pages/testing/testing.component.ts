import {Component} from '@angular/core';
import {Backend, TrainingExample} from "../../core/enums";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {MnistDataService} from "../../core/services/mnist-data.service";
import {ModelWrapperService} from "../../core/services/model-wrapper.service";
import {TrainingInfo, TrainingStats} from "../../core/interfaces";
import * as tf from "@tensorflow/tfjs";
import {Logs} from "@tensorflow/tfjs";
import {cloneObject} from "../../shared/helperfunctions";


@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent {
  hyperParameter = new FormGroup({
    example: new FormControl(TrainingExample.MNIST, Validators.required),
    backend: new FormControl(Backend.WEB_GPU, Validators.required),
    trainDataSize: new FormControl(5000, Validators.required),
    epochs: new FormControl(10, Validators.required),
    batchSize: new FormControl(500, Validators.required)
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

  constructor(private mnistDataService: MnistDataService, private modelWrapperService: ModelWrapperService) {
  }

  async initBackend() {
    const backendControl = this.hyperParameter.get('backend');
    if (backendControl) {
      await tf.setBackend(backendControl.value!.toString());
      await tf.ready();
    }
  }

  async startTraining() {
    await this.modelWrapperService.load(this.hyperParameter.get('example')?.value!);
    await this.initBackend()
    this.trainingStats.trainingTime = await this.train();
    this.trainingHistory.push(cloneObject(this.trainingStats));
  }

  stopTraining() {
    this.stopTrainingFlag = true;
  }

  async train() {
    const example = this.hyperParameter.get('example')?.value!;
    const backend = this.hyperParameter.get('backend')?.value!;
    const batchSize = this.hyperParameter.get('batchSize')?.value!;
    const epochs = this.hyperParameter.get('epochs')?.value!;
    const sampleSize = this.hyperParameter.get('trainDataSize')?.value!;
    this.trainingStats.trainingInfo.example = example;
    this.trainingStats.trainingInfo.backend = backend;
    this.trainingStats.trainingInfo.batchSize = batchSize;
    this.trainingStats.trainingInfo.epochs = epochs;
    this.trainingStats.trainingInfo.sampleSize = sampleSize;

    const {trainXs, trainYs, testXs, testYs} = this.modelWrapperService.prepData(example, batchSize);
    const model = this.modelWrapperService.getModel(example);
    const NumBatchesInEpoch = Math.ceil(trainXs.shape[0] / batchSize);
    const totalNumBatches = NumBatchesInEpoch * epochs;
    const fitCallback = {
      onTrainBegin: async (logs?: Logs) => {
        this.trainingInProgress = true;
      },
      onTrainEnd: async (logs?: Logs) => {
        this.trainingInProgress = false;
        this.trainingDone = true;
      },
      onEpochBegin: async (epoch: number, logs?: Logs) => {
        this.trainingStats.epoch = epoch;
      },
      onEpochEnd: async (epoch: number, logs?: Logs) => {
        this.trainingStats.accuracy = logs!['acc'];
        this.trainingStats.loss = logs!['loss'];
      },
      onBatchBegin: async (batch: number, logs?: Logs) => {
        this.trainingStats.batch = batch;
      },
      onBatchEnd: async (batch: number, logs?: Logs) => {
        this.trainingStats.progress = (this.trainingStats.epoch * NumBatchesInEpoch + batch) / totalNumBatches * 100;
        this.trainingStats.accuracy = logs!['acc'];
        this.trainingStats.loss = logs!['loss'];
      },
      onYield: async (epoch: number, batch: number, logs?: Logs) => {
        model.stopTraining = this.stopTrainingFlag;
        this.stopTrainingFlag = false;
      }
    }
    const startTime = performance.now();
    const h = await model.fit(trainXs, trainYs, {
        batchSize: batchSize, validationData: [testXs, testYs], epochs: epochs, shuffle: true, callbacks: fitCallback
      }
    )
    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    return totalTimeInMilliseconds;
  }

}
