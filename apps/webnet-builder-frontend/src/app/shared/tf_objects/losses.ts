import * as tf from '@tensorflow/tfjs';

export const losses = new Map<string, { tooltip: string, function: any }>([
  ['meanSquaredError', {
    tooltip: 'Mean Squared Error',
    function: tf.losses.meanSquaredError
  }],
  ['absoluteDifference', {
    tooltip: 'Absolute Difference Loss',
    function: tf.losses.absoluteDifference
  }],
  ['weightedLoss', {
    tooltip: 'Weighted Loss',
    function: tf.losses.computeWeightedLoss
  }],
  ['cosineDistance', {
    tooltip: 'Cosine Distance Loss',
    function: tf.losses.cosineDistance
  }],
  ['hingeLoss', {
    tooltip: 'Hinge Loss',
    function: tf.losses.hingeLoss
  }],
  ['huberLoss', {
    tooltip: 'Huber Loss',
    function: tf.losses.huberLoss
  }],
  ['logLoss', {
    tooltip: 'Log Loss',
    function: tf.losses.logLoss
  }],
  ['sigmoidCrossEntropy', {
    tooltip: 'Sigmoid Cross Entropy Loss',
    function: tf.losses.sigmoidCrossEntropy
  }],
  ['softmaxCrossEntropy', {
    tooltip: 'Softmax Cross Entropy Loss',
    function: tf.losses.softmaxCrossEntropy
  }]
]);
