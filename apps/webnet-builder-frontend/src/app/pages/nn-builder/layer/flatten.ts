import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {Selection} from "d3";
import * as d3 from "d3";
import {layerConfig} from "./layerconfig";


export class Flatten extends Layer {
  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.flatten, layerConfig.flatten, modelBuilderService );
  }

  override createLayer(): Selection<any, any, any, any> {
    const flattenData = { name: "Flatten", neuronCount: Math.min(12, 64) };

    const flattenGrp = d3.select("#svg-container").append("g")
      .classed("layerGroup", true)
      .attr("stroke", "black")
      .attr("transform", "translate(500, 160)");

    flattenGrp.append("rect")
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33FF57");

    flattenGrp.append("text")
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(flattenData.name);

    const numNeurons = Math.min(flattenData.neuronCount,7);

    const neuronRadius = 8;
    const neuronMargin = 4;
    const totalHeight = numNeurons * (2 * neuronRadius + neuronMargin) - neuronMargin;
    const startY = (150 - totalHeight) / 2;

    for (let i = 0; i < numNeurons; i++) {
      flattenGrp.append("circle")
        .attr("cx", 30)
        .attr("cy", startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius)
        .attr("r", neuronRadius)
        .style("fill", "#FF5733");
    }

    if (flattenData.neuronCount > 8) {
      flattenGrp.append("text")
        .attr("x", 30)
        .attr("y", startY + 7 * (2 * neuronRadius + neuronMargin) + 15)
        .attr("text-anchor", "middle")
        .text("...");
    }
    return flattenGrp;
  }

  override mouseLeave(event: any) {
    this.svgElement.style("cursor", "default").select("rect").style("fill", "#33FF57");
  }
}
