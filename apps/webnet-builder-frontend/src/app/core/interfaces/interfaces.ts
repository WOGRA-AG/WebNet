export interface TrainingStats {
  trainingInfo: TrainingInfo
  epoch: number,
  batch: number,
  loss: number,
  accuracy: number,
  progress: number,
  trainingTime: number,
}

export interface TrainingInfo {
  example: string,
  backend: string,
  epochs: number,
  batchSize: number,
  sampleSize: number,
}

export interface XY {
  x: number,
  y: number
}

export interface TrainStats {
  epoch: number,
  loss: number | undefined,
  accuracy: number | undefined,
  progress: number,
  time: number
}

export interface Weight {
  values: number[],
  shape: number[]
};

export interface Weights {
  weights: Weight,
  recurrentWeights?: Weight,
  bias: Weight
}
