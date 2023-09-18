import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {Selection} from "d3";
import * as d3 from "d3";
import {FormBuilder} from "@angular/forms";


export class Flatten extends Layer {
  constructor(modelBuilderService: ModelBuilderService, fb: FormBuilder) {
    const config = {
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
    };
    super(tf.layers.flatten, config, modelBuilderService, fb);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const flattenData = {name: "Flatten", neuronCount: Math.min(12, 64)};

    const flattenGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", "translate(500, 160)");

    flattenGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33FF57");

    flattenGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(flattenData.name);

    const numNeurons = Math.min(flattenData.neuronCount, 7);

    const neuronRadius = 8;
    const neuronMargin = 4;
    const totalHeight = numNeurons * (2 * neuronRadius + neuronMargin) - neuronMargin;
    const startY = (150 - totalHeight) / 2;

    for (let i = 0; i < numNeurons; i++) {
      flattenGrp.append("circle")
        .classed('selectable', true)
        .attr("cx", 30)
        .attr("cy", startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius)
        .attr("r", neuronRadius)
        .style("fill", "#FF5733");
    }

    if (flattenData.neuronCount > 8) {
      flattenGrp.append("text")
        .classed('untouchable', true)
        .attr("x", 30)
        .attr("y", startY + 7 * (2 * neuronRadius + neuronMargin) + 15)
        .attr("text-anchor", "middle")
        .text("...");
    }

    this.addInputAnchor(flattenGrp);
    this.addOutputAnchor(flattenGrp);
    return flattenGrp;
  }

}
