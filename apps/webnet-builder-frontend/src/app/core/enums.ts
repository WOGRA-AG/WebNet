export enum Backend {
  WEB_GPU = 'webgpu',
  WEB_GL = 'webgl',
  WEB_ASSEMBLY = 'wasm',
  CPU = 'cpu'
}

export enum TrainingExample {
  MNIST="mnist",
  TEXT="text"
}

export enum LayerType {
  Input = "input",
  Dense = "dense",
  Convolution = "convolution",
  Flatten = "flatten",
  Output = "output"
}
