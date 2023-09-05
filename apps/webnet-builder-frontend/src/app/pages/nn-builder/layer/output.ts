import * as d3 from "d3";
import { Selection } from "d3";
import { layerConfig } from "./layerconfig";
import { ModelBuilderService } from "../../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import { Layer } from "./layer";

export class Output extends Layer {
  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.dense, layerConfig.dense, modelBuilderService);
  }

  override createLayer(): Selection<any, any, any, any> {
    const outputData = { name: "Output", neuronCount: 10 };

    const outputGrp = d3.select("#svg-container").append("g")
      .classed("layerGroup", true)
      .attr("stroke", "black")
      .attr("transform", "translate(1100, 200)");

    outputGrp.append("rect")
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#FF5733");

    outputGrp.append("text")
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
        .attr("cx", 30)
        .attr("cy", startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius)
        .attr("r", neuronRadius)
        .style("fill", "#5733FF");
    }

    if (outputData.neuronCount > 7) {
      outputGrp.append("text")
        .attr("x", 30)
        .attr("y", startY + 7 * (2 * neuronRadius + neuronMargin) + 15)
        .attr("text-anchor", "middle")
        .text("...");
    }

    outputGrp.on("mouseenter", () => {
      outputGrp.style("cursor", "pointer");
      outputGrp.select("rect").style("fill", "lightgray");
    });

    outputGrp.on("mouseleave", () => {
      outputGrp.style("cursor", "default");
      outputGrp.select("rect").style("fill", "#FF5733");
    });

    return outputGrp;
  }

  override unselect() {
    this.svgElement.style("cursor", "default").select("rect").style("fill", "#FF5733");
  }
}
