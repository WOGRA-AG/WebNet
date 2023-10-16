export const Activation = {
  key: 'activation',
  label: 'Activation Function',
  controlType: 'dropdown',
  options: {softmax: 'Softmax', sigmoid: 'Sigmoid', relu: 'Relu'},
  tooltip: 'Activation function to use. If unspecified, no activation is applied.'
};

export const Units = {
  key: 'units',
  label: 'Units',
  controlType: 'textbox',
  type: 'number',
  tooltip: 'Positive integer, dimensionality of the output space.'
};

export const Shape = {
  key: 'shape',
  label: 'Shape',
  controlType: 'textbox',
  type: 'text',
  tooltip: 'A shape, not including the batch size. For instance, shape=[32] indicates that the expected input will be batches of 32-dimensional vectors.',
};

export const Padding = {
  key: 'padding',
  label: 'Padding',
  controlType: 'dropdown',
  options: {valid: 'Valid', same: 'Same', casual: 'Casual'},
  tooltip: ' Padding mode.'
};
