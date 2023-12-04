import {TrainStats, XY} from "./interfaces";
import {StorageOption} from "../enums";

export interface Project {
  projectInfo: ProjectInfo,
  dataset: Dataset,
  builder: Builder,
  trainConfig: TrainingConfig,
  trainRecords: TrainingRecords[]
}

export interface ProjectInfo {
  id: string,
  name: string,
  lastModified: Date,
  storeLocation: StorageOption
}

export interface Dataset {
  fileName: string,
  data: { [key: string]: any }[],
  columns: { name: string, type: string, uniqueValues: number, encoding: string}[],
  inputColumns: string[],
  targetColumns: string[]
}

export interface Builder {
  layers: { id?: string, type: string, parameters?: any, position?: XY }[],
  connections: { source: string, destination: string | undefined }[],
  nextLayerId: number,
}

export interface TrainingConfig {
  epochs: number,
  batchSize: number,
  optimizer: string,
  learningRate: number,
  loss: string,
  accuracyPlot: boolean,
  lossPlot: boolean,
  shuffle: boolean,
  earlyStopping: boolean,
  saveTraining: boolean,
  useExistingWeights: boolean,
  validationSplit: number,
  tfBackend: string
}

export interface MetricHistory {
  loss: XY[],
  val_loss: XY[],
  acc: XY[],
  val_acc: XY[]
}

export interface TrainingRecords {
  id: number,
  date: Date,
  config: TrainingConfig,
  datasetName: string,
  builder: Builder,
  trainStats: TrainStats,
  history: MetricHistory
}
