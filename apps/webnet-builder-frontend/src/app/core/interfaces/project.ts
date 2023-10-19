import {XY} from "./interfaces";

export interface Project {
  projectInfo: ProjectInfo,
  dataset: Dataset,
  builder: Builder,
  trainConfig: TrainingConfig
}
export interface ProjectInfo {
  name: string
}

export interface Dataset {
  type: string,
  data: string
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
