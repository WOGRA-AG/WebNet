import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {Weights, XY} from "../../core/interfaces/interfaces";
import {LayerType} from "../../core/enums";
import {Activation, RecurrentActivation, Units} from "../configuration";

export class Lstm extends Layer {
  override layerType = LayerType.Lstm;
  constructor(id: string, parameters: {units: number, activation: string, recurrentActivation: string, weights: Weights}, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Lstm',
      title: 'Lstm Layer Parameter',
      formConfig: [
        Units,
        Activation,
        RecurrentActivation
      ]
    };

    const layerForm = fb.group({
      units: [parameters.units, [Validators.required, Validators.minLength(1)]],
      activation: [parameters.activation, [Validators.required]],
      recurrentActivation: [parameters.recurrentActivation, [Validators.required]],
    });
    super(id, tf.layers.lstm, position, config, modelBuilderService, layerForm, parameters?.weights);
  }

  protected override createLayer(){
    const lstmLayerData = { name: "LSTM", numCells: 3 };

    const lstmGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${this.position.y})`);

    lstmGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 200)
      .attr("height", 120)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#FFD700"); // Use a suitable color for LSTM

    lstmGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 100)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(lstmLayerData.name);

    const cellWidth = 50;
    const cellHeight = 80;
    const cellMargin = 20;

    const startX = (200 - (lstmLayerData.numCells * (cellWidth + cellMargin) - cellMargin)) / 2;

    for (let i = 0; i < lstmLayerData.numCells; i++) {
      const x = startX + i * (cellWidth + cellMargin);
      const y = 20;

      // Draw the long-term memory (upper rectangle)
      lstmGrp.append("rect")
        .classed('selectable', true)
        .attr("x", x)
        .attr("y", y)
        .attr("width", cellWidth)
        .attr("height", cellHeight / 2)
        .style("fill", "#87CEEB");

      // Draw the short-term memory (lower rectangle)
      lstmGrp.append("rect")
        .classed('selectable', true)
        .attr("x", x)
        .attr("y", y + cellHeight / 2)
        .attr("width", cellWidth)
        .attr("height", cellHeight / 2)
        .style("fill", "#FF5733");

      // Draw a connection line between short-term and long-term memory
      lstmGrp.append("line")
        .attr("x1", x + cellWidth / 2)
        .attr("y1", y + cellHeight / 2)
        .attr("x2", x + cellWidth / 2)
        .attr("y2", y + cellHeight)
        .attr("stroke", "black");
    }

    this.addInputAnchor(lstmGrp);
    this.addOutputAnchor(lstmGrp);
    return lstmGrp;
  }
}
