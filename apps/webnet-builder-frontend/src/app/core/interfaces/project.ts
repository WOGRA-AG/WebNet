import {XY} from "./interfaces";
import {StorageOption} from "../enums";

export interface Project {
  projectInfo: ProjectInfo,
  dataset: Dataset,
  builder: Builder,
  trainConfig: TrainingConfig
}
export interface ProjectInfo {
  id: string,
  name: string,
  lastModified: Date,
  storeLocation: StorageOption
}

export interface Dataset {
  type: string,
  data: { [key: string]: any }[];
}

export interface Builder {
  layers: {id?: string, type: string, parameters?: any, position?: XY }[],
  connections: { source: string, destination: string|undefined }[]
}

export interface TrainingConfig {
  optimizer: string,
  learningRate: number,
  loss: string,
  accuracyPlot: boolean,
  lossPlot: boolean
}
