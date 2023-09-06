import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {layerConfig} from "../layerconfig";

export class Convolution extends Layer {

  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.conv3d, layerConfig.convolution, modelBuilderService);
  }

  override createLayer() {
    const convLayerData = { name: "Convolutional", numFilters: 3, filterSize: 30 };

    const filterColors = ["#FF5733", "#33FF57", "#5733FF"];

    const convGrp = d3.select("#inner-svg-container").append("g")
      .classed("layerGroup", true)
      .attr("stroke", "black")
      .attr("transform", "translate(600, 160)");

    convGrp.append("rect")
      .attr("width", 140)
      .attr("height", 100)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33A3FF");

    convGrp.append("text")
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
  override unselect() {
    this.svgElement.style("cursor", "default").select("rect").style("fill", "#33A3FF");
  }

}
