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
  }
}
