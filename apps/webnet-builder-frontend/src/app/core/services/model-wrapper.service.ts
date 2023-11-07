import {Injectable} from '@angular/core';
import {MnistDataService} from "./model-data-services/mnist-data.service";
import {TrainingExample} from "../enums";
import * as tf from '@tensorflow/tfjs';

@Injectable({
  providedIn: 'root'
})
export class ModelWrapperService {

  constructor(private mnistDataService: MnistDataService) {
  }

  getModel(trainingExample: string): tf.LayersModel|undefined {
    return this.getService(trainingExample)?.getModel();
  }

  async load(trainingExample: string): Promise<void> {
    await this.getService(trainingExample)?.load();
  }

  nextTrainBatch(batchSize: number, trainingExample: string): any {
    return this.getService(trainingExample)?.nextTrainBatch(batchSize);
  }

  nextTestBatch(batchSize: number, trainingExample: string): any  {
    return this.getService(trainingExample)?.nextTestBatch(batchSize);
  }

  nextBatch(batchSize: number, data: any, index: CallableFunction, trainingExample: string): any  {
    return this.getService(trainingExample)?.nextBatch(batchSize, data, index);
  }

  prepData(trainingExample: string, trainDataSize: number): any  {
    return this.getService(trainingExample)?.prepData(trainDataSize);
  }

  getService(trainingExample: string): MnistDataService|null {
    switch (trainingExample) {
      case TrainingExample.MNIST:
        return this.mnistDataService;
      default:
        return null;
    }
  }
}
