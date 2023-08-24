import {Injectable} from '@angular/core';
import {MnistDataService} from "./mnist-data.service";
import {TrainingExample} from "../enums";

@Injectable({
  providedIn: 'root'
})
export class ModelWrapperService {

  constructor(private mnistDataService: MnistDataService) {
  }

  getModel(trainingExample: string) {
    return this.getService(trainingExample).getModel();
  }

  async load(trainingExample: string) {
    await this.getService(trainingExample).load();
  }

  nextTrainBatch(batchSize: number, trainingExample: string) {
    return this.getService(trainingExample).nextTrainBatch(batchSize);
  }

  nextTestBatch(batchSize: number, trainingExample: string) {
    return this.getService(trainingExample).nextTestBatch(batchSize);
  }

  nextBatch(batchSize: number, data: any, index: CallableFunction, trainingExample: string) {
    return this.getService(trainingExample).nextBatch(batchSize, data, index);
  }

  prepData(trainingExample: string) {
    return this.getService(trainingExample).prepData();
  }

  getService(trainingExample: string) {
    switch (trainingExample) {
      case TrainingExample.MNIST:
        return this.mnistDataService;
    }
    return this.mnistDataService;
  }
}
