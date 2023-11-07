import {TrainStats, XY} from "./interfaces";
import {StorageOption} from "../enums";

export interface Project {
  projectInfo: ProjectInfo,
  dataset: Dataset,
  builder: Builder,
  trainConfig: TrainingConfig,
  trainHistory: TrainingHistory[]
}

export interface ProjectInfo {
  id: string,
  name: string,
  lastModified: Date,
  storeLocation: StorageOption
}

export interface Dataset {
  type: string,
  fileName: string,
  data: { [key: string]: any }[],
  columns: string[],
  inputColumns: string[],
  targetColumns: string[]
}

export interface Builder {
  layers: { id?: string, type: string, parameters?: any, position?: XY }[],
  connections: { source: string, destination: string | undefined }[]
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
  saveTraining: boolean,
  useWeights: boolean,
  validationSplit: number
}

export interface TrainingHistory {
  id: number,
  date: Date,
  config: TrainingConfig,
  builder: Builder,
  trainStats: TrainStats
}
