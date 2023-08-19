import {Component, Input} from '@angular/core';
import {MnistDataService} from "../../../core/services/mnist-data.service";
import * as tf from "@tensorflow/tfjs";
import '@tensorflow/tfjs-backend-webgpu';

@Component({
  selector: 'app-training-container',
  templateUrl: './training-container.component.html',
  styleUrls: ['./training-container.component.scss']
})
export class TrainingContainerComponent {
  @Input({required: true}) backend!: string;
  trainingTime: number = 0;
  trainingInProgress: boolean = false;
  trainingDone: boolean = false;
  constructor(private mnistDataService: MnistDataService) {
  }

  async train(backend: string) {
    await tf.setBackend(backend);
    await tf.ready();
    const {BATCH_SIZE, trainXs, trainYs, testXs, testYs} = this.prepData();
    const model = this.getModel();

    const startTime = performance.now();
    await model.fit(trainXs, trainYs, {
        batchSize: BATCH_SIZE, validationData: [testXs, testYs], epochs: 100, shuffle: true
      }
    )
    const endTime = performance.now();
    const totalTimeInMilliseconds = endTime - startTime;
    return totalTimeInMilliseconds;
  }

  getModel() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
      kernelSize: 5, filters: 16, strides: 1, activation: 'relu', kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
      units: NUM_OUTPUT_CLASSES, kernelInitializer: 'varianceScaling', activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer, loss: 'categoricalCrossentropy', metrics: ['accuracy'],
    });

    return model;
  }

  prepData() {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];

    const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = 5000;
    const TEST_DATA_SIZE = 1000;

    const [trainXs, trainYs] = tf.tidy(() => {
      const d = this.mnistDataService.nextTrainBatch(TRAIN_DATA_SIZE);
      return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels];
    });

    const [testXs, testYs] = tf.tidy(() => {
      const d = this.mnistDataService.nextTestBatch(TEST_DATA_SIZE);
      return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels];
    });
    return {BATCH_SIZE, trainXs, trainYs, testXs, testYs};
  }

  async startTraining() {
    this.trainingInProgress = true;
    await this.mnistDataService.load();
    this.trainingTime = await this.train(this.backend);
    this.trainingInProgress = false;
    this.trainingDone = true;
  }
}
