import {Injectable} from '@angular/core';
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {BehaviorSubject} from "rxjs";
import {TrainStats} from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  stopTrainingFlag: boolean = false;
  timer: any;
  trainingTime: number = 0;
  trainingStats: TrainStats = {accuracy: undefined, loss: undefined, progress: 0, time: 0};
  trainingStatsSubject: BehaviorSubject<TrainStats> = new BehaviorSubject<TrainStats>(this.trainingStats);
  trainingInProgressSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private modelBuilderService: ModelBuilderService) {}

  stopTraining(): void {
    this.stopTrainingFlag = true;
  }

  startTimer() {
    this.trainingTime = 0;
    this.timer = setInterval(() => {
      this.trainingTime++;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
  }

  async trainingReady(): Promise<{ dataset: boolean, model: boolean }> {
    const model = await this.modelBuilderService.isModelReady();
    const dataset = true;
    return {dataset: dataset, model: model}
  }

  async train(parameter: any): Promise<number|null> {
    const X = tf.ones([8, 10]);
    const Y = tf.ones([8, 1]);
    const EPOCHS = 1000;
    const BATCH_SIZE = 1;
    const SHUFFLE = true;
    const YIELD_EVERY = 'auto';
    const BATCHES_PER_EPOCH = Math.ceil(X.shape[0] / BATCH_SIZE);
    const TOTAL_NUM_BATCHES = EPOCHS * BATCHES_PER_EPOCH;

    const model = await this.modelBuilderService.generateModel();
    if (!model) return null;

    model.compile({
      optimizer: parameter.optimizer(parameter.learningRate),
      loss: parameter.loss
    });

    const fitCallback = {
      onTrainBegin: async (logs?: tf.Logs) => {
        this.startTimer();
        this.trainingStatsSubject.next({accuracy: undefined, loss: undefined, progress: 0, time: 0});
        this.trainingInProgressSubject.next(true);
      },
      onTrainEnd: async (logs?: tf.Logs) => {
        this.stopTimer();
        this.trainingStats.progress = 100;
        this.trainingStats.time = this.trainingTime;
        this.trainingStatsSubject.next(this.trainingStats);
        this.trainingInProgressSubject.next(false);
      },
      onYield: async (epoch: number, batch: number, logs?: tf.Logs) => {
        const progress = (epoch * BATCHES_PER_EPOCH + batch) / TOTAL_NUM_BATCHES * 100;
        this.trainingStats = {accuracy: logs!['acc'], loss: logs!['loss'], progress: progress, time: this.trainingTime}
        this.trainingStatsSubject.next(this.trainingStats);
        model!.stopTraining = this.stopTrainingFlag;
        this.stopTrainingFlag = false;
      }
    }
    const startTime = performance.now();
    const h = await model.fit(X,Y, {
      batchSize: BATCH_SIZE,
      epochs: EPOCHS,
      callbacks: fitCallback,
      shuffle: SHUFFLE,
      yieldEvery: YIELD_EVERY
    });

    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    return totalTimeInMilliseconds;
  }

}
