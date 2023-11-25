export const Activation = {
  key: 'activation',
  label: 'Activation Function',
  controlType: 'dropdown',
  options: {
    softmax: 'Softmax',
    sigmoid: 'Sigmoid',
    relu: 'ReLU',
    elu: 'ELU',
    hardSigmoid: 'Hard Sigmoid',
    linear: 'Linear',
    relu6: 'ReLU6',
    selu: 'SELU',
    softplus: 'Softplus',
    softsign: 'Softsign',
    tanh: 'Tanh',
    swish: 'Swish',
    mish: 'Mish'
  }
};

export const RecurrentActivation = {
  key: 'recurrentActivation',
  label: 'Recurrent Activation Function',
  controlType: 'dropdown',
  options: {
    softmax: 'Softmax',
    sigmoid: 'Sigmoid',
    relu: 'ReLU',
    elu: 'ELU',
    hardSigmoid: 'Hard Sigmoid',
    linear: 'Linear',
    relu6: 'ReLU6',
    selu: 'SELU',
    softplus: 'Softplus',
    softsign: 'Softsign',
    tanh: 'Tanh',
    swish: 'Swish',
    mish: 'Mish'
  }
};

export const Units = {
  key: 'units',
  label: 'Units',
  controlType: 'textbox',
  type: 'number',
  hint: 'Number of Neurons.'
};

export const Shape = {
  key: 'shape',
  label: 'Input Shape',
  controlType: 'textbox',
  type: 'text',
  tooltip: 'Defines the shape of the input data, excluding the batch size. For example, shape=[6] indicates that each input in a batch will have 6 features. For time series data, use a 2D array like [timesteps, features], where timesteps represent the sequence length and features represent the number of features at each time step.',
  hint: 'Number or comma separated numbers.'
};

export const Padding = {
  key: 'padding',
  label: 'Padding Mode',
  controlType: 'dropdown',
  options: {valid: 'Valid', same: 'Same', casual: 'Casual'},
};

export const Rate = {
  key: 'rate',
  label: 'Rate',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'Fraction of the input neurons to drop.',
  hint: 'Float between 0 and 1.'
};

export const Filters = {
  key: 'filters',
  label: 'Filters',
  controlType: 'textbox',
  type: 'number',
  hint: 'Number of filters.'
};

export const KernelSize = {
  key: 'kernelSize',
  label: 'Kernel Size',
  controlType: 'textbox',
  type: 'number',
  hint: 'Dimension of the Convolution Window.'
};

export const Strides = {
  key: 'strides',
  label: 'Strides',
  controlType: 'textbox',
  type: 'number',
  hint: 'Number of Strides.'
};

export const PoolSize = {
  key: 'poolSize',
  label: 'Pool Size',
  controlType: 'textbox',
  type: 'number',
  hint: 'Factor by which to downscale in each dimension.',
};
