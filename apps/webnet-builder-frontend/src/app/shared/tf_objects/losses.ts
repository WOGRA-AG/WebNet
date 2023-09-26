import * as tf from '@tensorflow/tfjs';

export const losses: { value: string, tooltip: string, function: Function }[] = [
  {
    value: 'meanSquaredError',
    tooltip: 'Mean Squared Error',
    function: tf.losses.meanSquaredError
  },
  {
    value: 'absoluteDifference',
    tooltip: 'Absolute Difference Loss',
    function: tf.losses.absoluteDifference
  },
  {
    value: 'weightedLoss',
    tooltip: 'Weighted Loss ',
    function: tf.losses.computeWeightedLoss
  },
  {
    value: 'cosineDistance',
    tooltip: 'Cosine Distance Loss',
    function: tf.losses.cosineDistance
  },
  {
    value: 'hingeLoss',
    tooltip: 'Hinge Loss',
    function: tf.losses.hingeLoss
  },
  {
    value: 'huberLoss',
    tooltip: 'Huber Loss',
    function: tf.losses.huberLoss
  },
  {
    value: 'logLoss',
    tooltip: 'Log Loss',
    function: tf.losses.logLoss
  },
  {
    value: 'sigmoidCrossEntropy',
    tooltip: 'Sigmoid Cross Entropy Loss',
    function: tf.losses.sigmoidCrossEntropy
  },
  {
    value: 'softmaxCrossEntropy',
    tooltip: 'Softmax Cross Entropy Loss',
    function: tf.losses.softmaxCrossEntropy
  },
];
