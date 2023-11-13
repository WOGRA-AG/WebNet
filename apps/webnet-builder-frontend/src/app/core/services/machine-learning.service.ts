import {Injectable} from '@angular/core';
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import {BehaviorSubject} from "rxjs";
import {TrainStats, XY} from "../interfaces/interfaces";
import {ProjectService} from "./project.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";
import {Dataset} from "../interfaces/project";
import {ModelBuilderService} from "./model-builder.service";
import {Tensor} from "@tensorflow/tfjs";

@Injectable({
  providedIn: 'root'
})
export class MachineLearningService {
  stopTrainingFlag: boolean = false;
  timer: any;
  trainingTime: number = 0;
  trainingStats: TrainStats = {epoch: 0, accuracy: undefined, loss: undefined, progress: 0, time: 0};
  trainingStatsSubject: BehaviorSubject<TrainStats> = new BehaviorSubject<TrainStats>(this.trainingStats);
  trainingInProgressSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private projectService: ProjectService,
              private modelBuilderService: ModelBuilderService,
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
    const modelReady = this.projectService.model() ? true : false;
    const datasetReady = this.projectService.dataset().data.length > 0;
    return {dataset: datasetReady, model: modelReady}
  }

  normalize(data: tf.Tensor) {
    const dataMax = data.max();
    const dataMin = data.min();
    return data.sub(dataMin).div(dataMax.sub(dataMin));
  }

  compile(): void {
    const parameter = this.projectService.trainConfig();
    const optimizer = optimizers.get(parameter.optimizer)?.function!;
    const loss = losses.get(parameter.loss)?.function;
    this.projectService.model()?.compile({
      optimizer: optimizer(parameter.learningRate),
      loss: loss,
      metrics: ['accuracy', tf.metrics.binaryAccuracy, tf.metrics.recall]
    });
  }

  predict(X: Tensor, Y: Tensor): void {
    const x = this.normalize(X);
    const y = this.normalize(Y);
    const randomRowIndex = Math.floor(Math.random() * X.shape[0]);
    const randomRowX = x.slice([randomRowIndex], [1]);
    const randomRowY = y.slice([randomRowIndex], [1]);

    try {
      this.compile();
      const result = this.projectService.model()?.predict(randomRowX) as tf.Tensor2D;
      console.log("PREDICTION: ", result?.dataSync());
      console.log("TARGET: ", randomRowY.dataSync());
    } catch (e: any) {
      console.log(e.message);
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Predicting Failed',
          message: e.message,
          warning: true
        }
      });
    }
  }

  evaluate(x: any, y: any): void {
    const X = this.normalize(tf.tensor2d(x));
    const Y = this.normalize(tf.tensor1d(y));
    const randomRowIndex = Math.floor(Math.random() * X.shape[0]);
    const randomRowX = X.slice([randomRowIndex], [1]);
    const randomRowY = Y.slice([randomRowIndex], [1]);

    try {
      this.compile();
      const evaluation = this.projectService.model()?.evaluate(
        randomRowX, randomRowY)
      console.log(evaluation);
    } catch (e: any) {
      console.log(e.message);
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Evaluating Failed',
          message: e.message,
          warning: true
        }
      });
    }
  }

  updateWeights(): void {
    const model = this.projectService.model();
    if (model) {
      const builder = this.modelBuilderService.updateWeights(model);
      this.projectService.builder.set(builder);
    }
  }

  extractFeaturesAndTargets(dataset: Dataset): [Tensor, Tensor] {
    const inputColumns: string[] = dataset.inputColumns;
    const targetColumns: string[] = dataset.targetColumns;
    const numSamples: number = dataset.data.length;

    const X = dataset.data.map((item) => {
      const values = [];
      for (const column of inputColumns) {
        values.push(item[column]);
      }
      return values;
    });

    // todo: mapping is wrong, only works for one target predictions
    const Y = dataset.data.map((item) => {
      const values = [];
      for (const column of targetColumns) {
        values.push(item[column]);
      }
      return values;
    });

    return [tf.tensor(X, [numSamples, inputColumns.length]), tf.tensor(Y, [numSamples, targetColumns.length])];
  }

  async train(X: Tensor, Y: Tensor, plotContainer: HTMLElement): Promise<any> {
    const parameter = this.projectService.trainConfig();
    if (!parameter.useExistingWeights) {
      const model = await this.modelBuilderService.generateModel(parameter.useExistingWeights);
      this.projectService.model.set(model);
    }

    const normalizedX = this.normalize(X);
    const normalizedY = this.normalize(Y);

    const EPOCHS = parameter.epochs;
    const BATCH_SIZE = parameter.batchSize;
    const VALIDATION_SPLIT = parameter.validationSplit;
    const SHUFFLE = parameter.shuffle;
    const YIELD_EVERY = 'auto';
    const BATCHES_PER_EPOCH = Math.ceil(X.shape[0] / BATCH_SIZE);
    const TOTAL_NUM_BATCHES = EPOCHS * BATCHES_PER_EPOCH;

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
          epoch: epoch + 1,
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
      callbacks.push(tfvis.show.fitCallbacks(plotContainer, ['loss', 'val_loss'], {
        callbacks: ['onEpochEnd'],
        xLabel: 'Epoch',
        yLabel: 'Loss'
      }));
    }

    try {
      this.compile();
      // todo: use fitDataset instead for more memory-efficiency?
      const history = await this.projectService.model()?.fit(normalizedX, normalizedY, {
        batchSize: BATCH_SIZE,
        validationSplit: VALIDATION_SPLIT,
        epochs: EPOCHS,
        callbacks: callbacks,
        shuffle: SHUFFLE,
        yieldEvery: YIELD_EVERY
      });

      return history;
    } catch (e: any) {
      console.log(e.message);
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Training Failed',
          message: e.message,
          warning: true
        }
      });
    }
  }

  async showHistory(htmlContainer: HTMLElement, history: History): Promise<void> {
    // await tfvis.show.history(htmlContainer, history, ['loss', 'acc']);
  }

  async renderPlot(htmlContainer: HTMLElement, values: XY[][], series: string[], options: {xLabel: string, yLabel: string, width?: number}): Promise<void> {
    await tfvis.render.linechart(htmlContainer, {values: values, series: series}, options);
  }
}
