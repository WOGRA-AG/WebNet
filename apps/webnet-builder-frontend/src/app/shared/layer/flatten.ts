import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {Selection} from "d3";
import * as d3 from "d3";
import {NonNullableFormBuilder} from "@angular/forms";
import {Weights, XY} from "../../core/interfaces/interfaces";
import {LayerType} from "../../core/enums";



export class Flatten extends Layer {
  override layerType = LayerType.Flatten;
  constructor(id: string, parameters: {weights: Weights}, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Flatten',
      title: 'Flatten Layer Parameter',
      formConfig: []
    };
    const layerForm = fb.group({
    });
    super(id, tf.layers.flatten, position, config, modelBuilderService, layerForm, parameters?.weights);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const flattenData = {name: "Flatten", neuronCount: Math.min(12, 64)};

    const flattenGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${this.position.y})`);

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

    this.addInputAnchor(flattenGrp);
    this.addOutputAnchor(flattenGrp);
    return flattenGrp;
  }

}
