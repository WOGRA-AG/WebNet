import {Injectable} from '@angular/core';
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-wasm';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
setWasmPaths('/assets/wasm/');
import * as tfvis from "@tensorflow/tfjs-vis";
import {BehaviorSubject} from "rxjs";
import {TrainStats, XY} from "../interfaces/interfaces";
import {ProjectService} from "./project.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {optimizers} from "../../shared/ml_objects/optimizers";
import {losses} from "../../shared/ml_objects/losses";
import {ModelBuilderService} from "./model-builder.service";
import {Tensor} from "@tensorflow/tfjs";
import {DataFrame} from "danfojs";


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

  async ngOnInit(): Promise<void> {
    await tf.ready();
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
      metrics: ['accuracy',  tf.metrics.recall]
    });
  }

  predict(X: Tensor): string {
    try {
      // todo: input with comma separated values?
      // todo: + rnd example ?
      // show
      this.compile();
      const result = this.projectService.model()?.predict(X) as tf.Tensor2D;
      return result?.dataSync()[0].toString();
    } catch (e: any) {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Predicting Failed',
          message: e.message,
          warning: true
        }
      });
      return "-";
    }
  }

  evaluate(X: Tensor, Y: Tensor): void {
    const shape = this.modelBuilderService.getDataInputShape();

    const reshapedX = X.reshape([X.shape[0], ...shape]);
    const reshapedY = Y;

    try {
      this.compile();
      const evaluation: tf.Scalar[] = this.projectService.model()?.evaluate(
        reshapedX, reshapedY) as tf.Scalar[];
      const metricsNames = this.projectService.model()?.metricsNames;

      if (evaluation && metricsNames) {
        for (let i = 0; i < evaluation?.length; i++) {
          const tensor = evaluation[i];
          const metricName = metricsNames[i];
          const value = tensor.dataSync()[0];
        }
      }

      console.log("==========EVALOUATION==========");
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

  reshapeTensors(tensor: Tensor): Tensor|false {
    try {
      const shape = this.modelBuilderService.getDataInputShape();
      return tensor.reshape([tensor.shape[0], ...shape]);
    } catch (e: any) {
      return false;
    }
  }

  async extractFeaturesAndTargets(df: DataFrame): Promise<[Tensor, Tensor]> {
    const dataset = this.projectService.dataset();
    const inputColumns: string[] = dataset.inputColumns;
    const targetColumns: string[] = dataset.targetColumns;


    const dfInputColumns = df.columns.filter(column => inputColumns.includes(column.split('_')[0]));

    const inputs = df.loc({columns: dfInputColumns});
    const targets = df.loc({columns: targetColumns});

    return [inputs.tensor, targets.tensor];
  }

  async train(X: Tensor, Y: Tensor, plotContainer: HTMLElement): Promise<any> {
    const parameter = this.projectService.trainConfig();
    if (!parameter.useExistingWeights) {
      const model = await this.modelBuilderService.generateModel(parameter.useExistingWeights);
      this.projectService.model.set(model);
    }

    const EPOCHS = parameter.epochs;
    const BATCH_SIZE = parameter.batchSize;
    const VALIDATION_SPLIT = parameter.validationSplit;
    const SHUFFLE = parameter.shuffle;
    const YIELD_EVERY = 'auto';
    const BATCHES_PER_EPOCH = Math.ceil(X.shape[0] / BATCH_SIZE);
    const TOTAL_NUM_BATCHES = EPOCHS * BATCHES_PER_EPOCH;

    const fitCallback = new tf.CustomCallback({
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
    }, YIELD_EVERY);
    const callbacks: any[] = [fitCallback];

    if (parameter.accuracyPlot) {
      callbacks.push(new tf.CustomCallback(tfvis.show.fitCallbacks(plotContainer, ['acc', 'val_acc'], {
        callbacks: ['onEpochEnd'],
        xLabel: 'Epoch',
        yLabel: 'Accuracy',
        // width: 100,
        // height: 2000
      })));
    }
    if (parameter.lossPlot) {
      callbacks.push(new tf.CustomCallback(tfvis.show.fitCallbacks(plotContainer, ['loss', 'val_loss'], {
        callbacks: ['onEpochEnd'],
        xLabel: 'Epoch',
        yLabel: 'Loss'
      })));
    }
    if (parameter.earlyStopping) {
      callbacks.push(tf.callbacks.earlyStopping({monitor: 'val_acc', patience: 5}));
    }

    try {
      this.compile();

      // todo: use fitDataset instead for more memory-efficiency?
      const startTime = performance.now();
      const history = await this.projectService.model()?.fit(X, Y, {
        batchSize: BATCH_SIZE,
        validationSplit: VALIDATION_SPLIT,
        epochs: EPOCHS,
        callbacks: callbacks,
        shuffle: SHUFFLE,
      });
      const endTime = performance.now();
      const totalTimeInMilliseconds = endTime - startTime;
      console.log("TRAINING TIME: ", totalTimeInMilliseconds);
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

  async setTfBackend(backend: string): Promise<boolean> {
    await tf.setBackend(backend);
    await tf.ready();
    return tf.getBackend() === backend;
  }

  async showHistory(htmlContainer: HTMLElement, history: History): Promise<void> {
    // await tfvis.show.history(htmlContainer, history, ['loss', 'acc']);
  }

  async renderPlot(htmlContainer: HTMLElement, values: XY[][], series: string[], options: {
    xLabel: string,
    yLabel: string,
    width?: number
  }): Promise<void> {
    await tfvis.render.linechart(htmlContainer, {values: values, series: series}, options);
  }
}
