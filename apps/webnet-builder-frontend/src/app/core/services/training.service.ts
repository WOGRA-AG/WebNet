import {Injectable} from '@angular/core';
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import {BehaviorSubject} from "rxjs";
import {TrainStats} from "../interfaces/interfaces";
import {ProjectService} from "./project.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  stopTrainingFlag: boolean = false;
  timer: any;
  trainingTime: number = 0;
  trainingStats: TrainStats = {epoch: 0, accuracy: undefined, loss: undefined, progress: 0, time: 0};
  trainingStatsSubject: BehaviorSubject<TrainStats> = new BehaviorSubject<TrainStats>(this.trainingStats);
  trainingInProgressSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private projectService: ProjectService,
              public dialog: MatDialog) {
  }

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
    const modelReady =  this.projectService.model() ? true : false;
    const datasetReady = this.projectService.dataset().data.length > 0;
    return {dataset: datasetReady, model: modelReady}
  }

  // normalize(data: tf.Tensor) {
  //   const dataMax = data.max();
  //   const dataMin = data.min();
  //   return data.sub(dataMin).div(dataMax.sub(dataMin));
  // }

  async train(trainXs: any, trainYs: any, parameter: any, plotContainer: HTMLElement): Promise<any> {

    // const X = tf.ones([8, 10]);
    // const Y = tf.ones([8, 1]);
    // await this.mnistDataService.load();
    // const {trainXs, trainYs, testXs, testYs} = this.mnistDataService.prepData(5000);
    // const X = trainXs;
    // const Y = trainYs;
    const X = tf.tensor2d(trainXs);
    const Y = tf.tensor1d(trainYs);

    const EPOCHS = parameter.epochs;
    const BATCH_SIZE = parameter.batchSize;
    const VALIDATION_SPLIT = parameter.validationSplit;
    const SHUFFLE = parameter.shuffle;
    const YIELD_EVERY = 'auto';
    const BATCHES_PER_EPOCH = Math.ceil(X.shape[0] / BATCH_SIZE);
    const TOTAL_NUM_BATCHES = EPOCHS * BATCHES_PER_EPOCH;

    // console.log("#### 1")
    // this.projectService.model()?.layers.forEach((layer, index) => {
    //   if (layer.name === 'layer-3') {
    //     const weights = layer.getWeights();
    //     weights.forEach((weight, weightIndex) => {
    //       console.log(weight.dataSync()); // Print the weight data
    //     });
    //   }
    // });

    this.projectService.model()?.compile({
      optimizer: parameter.optimizer(parameter.learningRate),
      loss: parameter.loss,
      metrics: ['accuracy', tf.metrics.binaryAccuracy, tf.metrics.recall]
    });
    const fitCallback = {
      onTrainBegin: async (logs?: tf.Logs) => {
        this.startTimer();
        this.trainingStatsSubject.next({epoch: 0, accuracy: undefined, loss: undefined, progress: 0, time: 0});
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
        this.trainingStats = {
          epoch: epoch,
          accuracy: logs!['acc'],
          loss: logs!['loss'],
          progress: progress,
          time: this.trainingTime
        }
        this.trainingStatsSubject.next(this.trainingStats);
        this.projectService.model()!.stopTraining = this.stopTrainingFlag;
        this.stopTrainingFlag = false;
      }
    }
    const callbacks: any[] = [fitCallback];

    if (parameter.accuracyPlot) {
      callbacks.push(tfvis.show.fitCallbacks(plotContainer, ['acc'], {
        callbacks: ['onEpochEnd'],
        xLabel: 'Epoch',
        yLabel: 'Accuracy',
        // width: 100,
        // height: 2000
      }))
    }
    if (parameter.lossPlot) {
      callbacks.push(tfvis.show.fitCallbacks(plotContainer, ['loss'], {
        callbacks: ['onEpochEnd'],
        xLabel: 'Epoch',
        yLabel: 'Loss'
      }));
    }

    try {
      // todo: use fitDataset instead for more memory-efficiency?
      const history =  await this.projectService.model()?.fit(X, Y, {
        batchSize: BATCH_SIZE,
        validationSplit: VALIDATION_SPLIT,
        epochs: EPOCHS,
        callbacks: callbacks,
        shuffle: SHUFFLE,
        yieldEvery: YIELD_EVERY
      });
      // console.log("#### 2")
      // this.projectService.model()?.layers.forEach((layer, index) => {
      //   if (layer.name === 'layer-3') {
      //     const weights = layer.getWeights();
      //     weights.forEach((weight, weightIndex) => {
      //       console.log(weight.dataSync()); // Print the weight data
      //     });
      //   }
      // });
      return history;
    } catch (e: any) {
      console.log(e.message);
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Training Failed',
          message: e.message}
      });
    }
  }
}
