import {Builder, Dataset, Project, TrainingConfig} from "../../core/interfaces/project";
import {StorageOption} from "../../core/enums";

export class MnistTemplate {
  getProject(): Project {
    return {
      projectInfo: {id: '', name: '', lastModified: new Date(), storeLocation: StorageOption.InMemory},
      dataset: this.getDataset(),
      builder: this.getBuilder(),
      trainConfig: this.getTrainConfig(),
      trainRecords: []
    }
  }

  getTrainConfig(): TrainingConfig {
    return {
      epochs: 100,
      batchSize: 32,
      optimizer: 'adam',
      learningRate: 0.01,
      loss: 'meanSquaredError',
      accuracyPlot: true,
      lossPlot: false,
      shuffle: true,
      earlyStopping: false,
      saveTraining: true,
      useExistingWeights: false,
      validationSplit: 0.2,
      tfBackend: 'webgpu'
    }
  };

  getBuilder(): Builder {
    return {
      layers: [{
        "id": "layer-1",
        "type": "input",
        "position": {"x": 30, "y": 246},
        "parameters": {"shape": '28, 28, 1'}
      }, {
        "id": "layer-2",
        "type": "output",
        "position": {"x": 1119.390625, "y": 246},
        "parameters": {"units": 10, "activation": "softmax"}
      }, {
        "id": "layer-3",
        "type": "convolution",
        "position": {"x": 278, "y": 235},
        "parameters": {"filters": 3, "kernelSize": 2, "strides": 1, "padding": "valid", "activation": "relu"}
      }, {"id": "layer-4", "type": "maxpooling", "position": {"x": 496, "y": 204}, "parameters": {}}, {
        "id": "layer-5",
        "type": "flatten",
        "position": {"x": 735, "y": 175},
        "parameters": {"shape": "", "units": 500, "filter": 3, "kernelSize": 2}
      }],
      connections: [{"source": "layer-1", "destination": "layer-3"}, {
        "source": "layer-3",
        "destination": "layer-4"
      }, {"source": "layer-4", "destination": "layer-5"}, {"source": "layer-5", "destination": "layer-2"}],
      nextLayerId: 6,
    }
  }

  getModel() {
    return {
      "modelTopology": {
        "class_name": "Model", "config": {
          "name": "model4",
          "layers": [{
            "name": "input4",
            "class_name": "InputLayer",
            "config": {"batch_input_shape": [null, 28, 28, 1], "dtype": "float32", "sparse": false, "name": "input4"},
            "inbound_nodes": []
          }, {
            "name": "conv2d_Conv2D4",
            "class_name": "Conv2D",
            "config": {
              "filters": 3,
              "kernel_initializer": {
                "class_name": "VarianceScaling",
                "config": {"scale": 1, "mode": "fan_avg", "distribution": "normal", "seed": null}
              },
              "kernel_regularizer": null,
              "kernel_constraint": null,
              "kernel_size": [2, 2],
              "strides": [1, 1],
              "padding": "valid",
              "data_format": "channels_last",
              "dilation_rate": [1, 1],
              "activation": "relu",
              "use_bias": true,
              "bias_initializer": {"class_name": "Zeros", "config": {}},
              "bias_regularizer": null,
              "activity_regularizer": null,
              "bias_constraint": null,
              "name": "conv2d_Conv2D4",
              "trainable": true
            },
            "inbound_nodes": [[["input4", 0, 0, {}]]]
          }, {
            "name": "max_pooling2d_MaxPooling2D4",
            "class_name": "MaxPooling2D",
            "config": {
              "pool_size": [2, 2],
              "padding": "valid",
              "strides": [2, 2],
              "data_format": "channels_last",
              "name": "max_pooling2d_MaxPooling2D4",
              "trainable": true
            },
            "inbound_nodes": [[["conv2d_Conv2D4", 0, 0, {}]]]
          }, {
            "name": "flatten_Flatten4",
            "class_name": "Flatten",
            "config": {"name": "flatten_Flatten4", "trainable": true},
            "inbound_nodes": [[["max_pooling2d_MaxPooling2D4", 0, 0, {}]]]
          }, {
            "name": "dense_Dense4",
            "class_name": "Dense",
            "config": {
              "units": 10,
              "activation": "softmax",
              "use_bias": true,
              "kernel_initializer": {
                "class_name": "VarianceScaling",
                "config": {"scale": 1, "mode": "fan_avg", "distribution": "normal", "seed": null}
              },
              "bias_initializer": {"class_name": "Zeros", "config": {}},
              "kernel_regularizer": null,
              "bias_regularizer": null,
              "activity_regularizer": null,
              "kernel_constraint": null,
              "bias_constraint": null,
              "name": "dense_Dense4",
              "trainable": true
            },
            "inbound_nodes": [[["flatten_Flatten4", 0, 0, {}]]]
          }],
          "input_layers": [["input4", 0, 0]],
          "output_layers": [["dense_Dense4", 0, 0]]
        }, "keras_version": "tfjs-layers 4.10.0", "backend": "tensor_flow.js"
      },
      "format": "layers-model",
      "generatedBy": "TensorFlow.js tfjs-layers v4.10.0",
      "convertedBy": null,
      "weightsManifest": [{
        "paths": ["./weights.bin"],
        "weights": [{
          "name": "conv2d_Conv2D4/kernel",
          "shape": [2, 2, 1, 3],
          "dtype": "float32"
        }, {"name": "conv2d_Conv2D4/bias", "shape": [3], "dtype": "float32"}, {
          "name": "dense_Dense4/kernel",
          "shape": [507, 10],
          "dtype": "float32"
        }, {"name": "dense_Dense4/bias", "shape": [10], "dtype": "float32"}]
      }]
    }
  }

  getDataset(): Dataset {
    return {
      data: [{'text': 'MNIST DATASET!'}],
      fileName: 'mnist.csv',
      columns: [],
      inputColumns: [],
      targetColumns: []
    };
  }
}
