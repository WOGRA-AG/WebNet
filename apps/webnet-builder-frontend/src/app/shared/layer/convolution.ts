import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {NonNullableFormBuilder, Validators} from "@angular/forms";

export class Convolution extends Layer {

  constructor(modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Convolution',
      title: 'Convolution Layer Parameter',
      parameters: {
        filters: 3,
        kernelSize: 2
      },
      formConfig: [{
        key: 'filters',
        label: 'Filters',
        controlType: 'textbox',
        type: 'number'
      },
        {
          key: 'kernelSize',
          label: 'Kernel Size',
          controlType: 'textbox',
          type: 'number'
        },
        {
          key: 'strides',
          label: 'Strides',
          controlType: 'textbox',
          type: 'number'
        },
        {
          key: 'padding',
          label: 'Padding',
          controlType: 'textbox',
          type: 'number'
        },
        {
          key: 'activation',
          label: 'Activation Function',
          controlType: 'dropdown',
          options: {softmax: 'Softmax', sigmoid: 'Sigmoid', relu: 'Relu'}
        },]
    };
    const layerForm = fb.group({
      filters: [3, [Validators.required]],
      kernelSize: [2, [Validators.required]],
      strides: [1, [Validators.required]],
      padding: [2, [Validators.required]],
      activation: ['relu', [Validators.required]]
    })
    super(tf.layers.conv3d, config, modelBuilderService, fb, layerForm);
  }

  protected override createLayer() {
    const convLayerData = {name: "Convolutional", numFilters: 3, filterSize: 30};

    const filterColors = ["#FF5733", "#33FF57", "#5733FF"];

    const convGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", "translate(600, 160)");

    convGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 140)
      .attr("height", 100)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33A3FF");

    convGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 70)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(convLayerData.name);

    const filterWidth = convLayerData.filterSize;
    const filterHeight = convLayerData.filterSize;
    const filterSpacing = 10;

    for (let i = 0; i < convLayerData.numFilters; i++) {
      const x = 35 + i * (filterWidth - filterSpacing);
      const y = 20 + i * (filterHeight - filterSpacing);

      convGrp.append("rect")
        .classed('selectable', true)
        .attr("x", x)
        .attr("y", y)
        .attr("width", filterWidth)
        .attr("height", filterHeight)
        .style("fill", filterColors[i]);
    }

    this.addInputAnchor(convGrp);
    this.addOutputAnchor(convGrp);
    return convGrp;
  }

}
