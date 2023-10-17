import * as d3 from "d3";
import {Selection} from "d3";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {Activation, Units} from "../configuration";
import {XY} from "../../core/interfaces";
import {LayerType} from "../../core/enums";

export class Output extends Layer {
  override layerType = LayerType.Output;
  constructor(parameters: {units: number, activation: string}, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Output',
      title: 'Dense Layer Parameter',
      formConfig: [
        Units,
        Activation
      ]
    };
    const layerForm = fb.group({
      units: [1, [Validators.required, Validators.minLength(1)]],
      activation: ['sigmoid', [Validators.required]]
    })
    super(tf.layers.dense, position, config, modelBuilderService, layerForm);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const outputData = {name: "Output", neuronCount: 10};

    const outputGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${this.position.y})`);

    outputGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#FF5733");

    outputGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(outputData.name);

    const numNeurons = Math.min(outputData.neuronCount, 7);

    const neuronRadius = 8;
    const neuronMargin = 4;
    const totalHeight = numNeurons * (2 * neuronRadius + neuronMargin) - neuronMargin;
    const startY = (150 - totalHeight) / 2;

    for (let i = 0; i < numNeurons; i++) {
      outputGrp.append("circle")
        .classed('selectable', true)
        .attr("cx", 30)
        .attr("cy", startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius)
        .attr("r", neuronRadius)
        .style("fill", "#5733FF");
    }

    if (outputData.neuronCount > 7) {
      outputGrp.append("text")
        .classed('untouchable', true)
        .attr("x", 30)
        .attr("y", startY + 7 * (2 * neuronRadius + neuronMargin) + 15)
        .attr("text-anchor", "middle")
        .text("...");
    }

    this.addInputAnchor(outputGrp);
    return outputGrp;
  }
}
