import * as tf from '@tensorflow/tfjs';

export const optimizers = new Map<string, { tooltip: string, function: Function }>([
  ['sgd', {
    tooltip: 'Stochastic Gradient Descent',
    function: tf.train.sgd
  }],
  ['momentum', {
    tooltip: 'Momentum Gradient Descent',
    function: tf.train.momentum
  }],
  ['adagrad', {
    tooltip: 'Adagrad Algorithm',
    function: tf.train.adagrad
  }],
  ['adadelta', {
    tooltip: 'Adadelta Algorithm',
    function: tf.train.adadelta
  }],
  ['adam', {
    tooltip: 'Adam algorithm',
    function: tf.train.adam
  }],
  ['adamax', {
    tooltip: 'Adamax algorithm',
    function: tf.train.adamax
  }],
  ['rmsprop', {
    tooltip: 'RMSProp Gradient Descent',
    function: tf.train.rmsprop
  }]
]);
