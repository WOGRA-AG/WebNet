import * as tf from '@tensorflow/tfjs';

export const optimizers: {
  sgd: { tooltip: string; function: (learningRate: number) => tf.SGDOptimizer };
  momentum: {
    tooltip: string;
    function: (learningRate: number, momentum: number, useNesterov?: boolean | undefined) => tf.MomentumOptimizer
  };
  adagrad: { tooltip: string; function: (learningRate: number) => tf.AdagradOptimizer };
  adadelta: {
    tooltip: string;
    function: (learningRate: number, rho?: number | undefined, epsilon?: number | undefined) => tf.AdadeltaOptimizer
  };
  adam: {
    tooltip: string;
    function: (learningRate: number, beta1?: number | undefined, beta2?: number | undefined, epsilon?: number | undefined) => tf.AdamOptimizer
  };
  adamax: {
    tooltip: string;
    function: (learningRate: number, beta1?: number | undefined, beta2?: number | undefined, epsilon?: number | undefined) => tf.AdamaxOptimizer
  };
  rmsprop: {
    tooltip: string;
    function: (learningRate: number, rho?: number | undefined, momentum?: number | undefined, epsilon?: number | undefined) => tf.RMSPropOptimizer
  };
} = {
  sgd: {
    tooltip: 'Stochastic Gradient Descent',
    function: tf.train.sgd
  },
  momentum: {
    tooltip: 'Momentum Gradient Descent',
    function: tf.train.momentum
  },
  adagrad: {
    tooltip: 'Adagrad Algorithm',
    function: tf.train.adagrad
  },
  adadelta: {
    tooltip: 'Adadelta Algorithm',
    function: tf.train.adadelta
  },
  adam: {
    tooltip: 'Adam algorithm',
    function: tf.train.adam
  },
  adamax: {
    tooltip: 'Adamax algorithm',
    function: tf.train.adamax
  },
  rmsprop: {
    tooltip: 'RMSProp Gradient Descent',
    function: tf.train.rmsprop
  },
}
