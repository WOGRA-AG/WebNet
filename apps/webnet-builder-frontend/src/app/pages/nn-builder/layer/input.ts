import * as d3 from "d3";
import { Selection } from "d3";
import { layerConfig } from "./layerconfig";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";

export class Input extends Layer{

  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.dense, layerConfig.dense, modelBuilderService );
  }

  override createLayer(): Selection<any, any, any, any> {
    const inputData = { name: "Input", shape: [64, 64, 3] };

    const inputGrp = d3.select("#svg-container").append("g")
      .classed("layerGroup", true)
      .attr("stroke", "black")
      .attr("transform", "translate(30, 200)");

    inputGrp.append("rect")
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33FF57");

    inputGrp.append("text")
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(inputData.name);

    inputGrp.append("text")
      .attr("x", 30)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text(`Shape: [${inputData.shape.join(", ")}]`)
      .style("font-size", "10px");

    return inputGrp;
  }

  override unselect() {
    this.svgElement.style("cursor", "default").select("rect").style("fill", "#33FF57");
  }

}
