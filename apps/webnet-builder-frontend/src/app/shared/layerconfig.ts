export const layerConfig = {
  dense: {
    name: 'Dense',
    title: 'Dense Layer Parameter',
    parameters: {
      units: 5,
      activation: 'softmax',
    },
    formConfig: [{
      key: 'units',
      title: 'Dense Layer Parameter',
      label: 'Units',
      controlType: 'textbox',
      required: true,
      value: 5,
      type: 'number'
    }]
  },
  flatten: {
    name: 'Flatten',
    title: 'Flatten Layer Parameter',
    parameters: {
      shape: [4, 3],
    },
    formConfig: [{
      key: 'shape',
      label: 'Shape',
      controlType: 'textbox',
      required: true,
      value: 'Shape???',
      type: 'text'
    }]
  },
  convolution: {
    name: 'Convolution',
    title: 'Convolution Layer Parameter',
    parameters: {
      filters: 3,
      kernelSize: 2
    },
    formConfig: [{
      key: 'filter',
      label: 'Filters',
      controlType: 'textbox',
      required: true,
      value: 3,
      type: 'number'
    },
      {
        key: 'kernelSize',
        label: 'Kernel Size',
        controlType: 'textbox',
        required: true,
        value: 2,
        type: 'number'
      }]
  }
}
