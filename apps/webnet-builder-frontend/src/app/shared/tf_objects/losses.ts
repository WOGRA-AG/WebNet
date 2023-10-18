import * as tf from '@tensorflow/tfjs';

type LossFunction = (
  labels: tf.Tensor | tf.TensorLike,
  predictions: tf.Tensor | tf.TensorLike,
  weights?: tf.Tensor | tf.TensorLike,
  reduction?: tf.Reduction
) => tf.Tensor;

export const losses: {
  meanSquaredError: { tooltip: string, function: LossFunction }
  absoluteDifference: { tooltip: string, function: LossFunction }
  weightedLoss: { tooltip: string, function: Function }
  cosineDistance: { tooltip: string, function: Function }
  hingeLoss: { tooltip: string, function: LossFunction }
  huberLoss: { tooltip: string, function: LossFunction }
  logLoss: { tooltip: string, function: LossFunction }
  sigmoidCrossEntropy: { tooltip: string, function: LossFunction }
  softmaxCrossEntropy: { tooltip: string, function: LossFunction }
} = {
  meanSquaredError: {
    tooltip: 'Mean Squared Error',
    function: tf.losses.meanSquaredError
  },
  absoluteDifference: {
    tooltip: 'Absolute Difference Loss',
    function: tf.losses.absoluteDifference
  },
  weightedLoss: {
    tooltip: 'Weighted Loss',
    function: tf.losses.computeWeightedLoss
  },
  cosineDistance: {
    tooltip: 'Cosine Distance Loss',
    function: tf.losses.cosineDistance
  },
  hingeLoss: {
    tooltip: 'Hinge Loss',
    function: tf.losses.hingeLoss
  },
  huberLoss: {
    tooltip: 'Huber Loss',
    function: tf.losses.huberLoss
  },
  logLoss: {
    tooltip: 'Log Loss',
    function: tf.losses.logLoss
  },
  sigmoidCrossEntropy: {
    tooltip: 'Sigmoid Cross Entropy Loss',
    function: tf.losses.sigmoidCrossEntropy
  },
  softmaxCrossEntropy: {
    tooltip: 'Softmax Cross Entropy Loss',
    function: tf.losses.softmaxCrossEntropy
  }
};
