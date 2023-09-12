import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {Selection} from "d3";
import {layerConfig} from "../layerconfig";

export class Dense extends Layer {

  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.dense, layerConfig.dense, modelBuilderService);
  }

  override createLayer(): Selection<any, any, any, any> {
    const denseData = {name: "Dense", neuronCount: Math.min(9, 64)};

    const denseGrp: Selection<any, any, any, any> = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", "translate(300, 160)");

    denseGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#5733FF");

    denseGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(denseData.name);

    const numNeurons = Math.min(denseData.neuronCount, 7);

    const neuronRadius = 8;
    const neuronMargin = 4;
    const totalHeight = numNeurons * (2 * neuronRadius + neuronMargin) - neuronMargin;
    const startY = (150 - totalHeight) / 2;

    for (let i = 0; i < numNeurons; i++) {
      denseGrp.append("circle")
        .classed('selectable', true)
        .attr("cx", 30)
        .attr("cy", startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius)
        .attr("r", neuronRadius)
        .style("fill", "#FF5733");
    }

    if (denseData.neuronCount > 8) {
      denseGrp.append("text")
        .classed('untouchable', true)
        .attr("x", 30)
        .attr("y", startY + 7 * (2 * neuronRadius + neuronMargin) + 15)
        .attr("text-anchor", "middle")
        .text("...");
    }
    this.addOutputAnchor(denseGrp);
    this.addInputAnchor(denseGrp);
    return denseGrp;
  }

}
