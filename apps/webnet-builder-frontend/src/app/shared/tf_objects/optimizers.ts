import * as tf from '@tensorflow/tfjs';

export const optimizers: { value: string, tooltip: string, function: Function }[] = [
  {
    value: 'sgd',
    tooltip: 'Stochastic Gradient Descent',
    function: tf.train.sgd
  },
  {
    value: 'momentum',
    tooltip: 'Momentum Gradient Descent',
    function: tf.train.momentum
  },
  {
    value: 'adagrad',
    tooltip: 'Adagrad Algorithm',
    function: tf.train.adagrad
  },
  {
    value: 'Adadalta',
    tooltip: 'Adadelta Algorithm',
    function: tf.train.adadelta
  },
  {
    value: 'adam',
    tooltip: 'Adam algorithm',
    function: tf.train.adam
  },
  {
    value: 'adamax',
    tooltip: 'Adamax algorithm',
    function: tf.train.adamax
  },
  {
    value: 'rmsprop',
    tooltip: 'RMSProp Gradient Descent',
    function: tf.train.rmsprop
  },

];
