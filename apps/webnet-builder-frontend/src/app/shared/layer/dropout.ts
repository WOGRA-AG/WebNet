import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {Selection} from "d3";
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {Rate} from "../configuration";
import {XY} from "../../core/interfaces/interfaces";
import {LayerType} from "../../core/enums";

export class Dropout extends Layer {
  override layerType = LayerType.Dropout;
  constructor(id: string, parameters: {rate: number}, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Dropout',
      title: 'Dropout Layer Parameter',
      formConfig: [
        Rate
      ]
    };

    const layerForm = fb.group({
      rate: [parameters.rate, [Validators.required, Validators.min(0), Validators.max(1)]],
    });
    super(id, tf.layers.dropout, position, config, modelBuilderService, layerForm);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const dropoutData = { name: "Dropout", neuronCount: 9 };

    const dropoutGrp: Selection<any, any, any, any> = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${this.position.y})`);

    dropoutGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#FFD700"); // Using gold color for dropout

    dropoutGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 30)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(dropoutData.name);

    const numNeurons = Math.min(dropoutData.neuronCount, 7);

    const neuronRadius = 8;
    const neuronMargin = 4;
    const totalHeight = numNeurons * (2 * neuronRadius + neuronMargin) - neuronMargin;
    const startY = (150 - totalHeight) / 2;

    for (let i = 0; i < numNeurons; i++) {
      const neuronY = startY + i * (2 * neuronRadius + neuronMargin) + neuronRadius;

      dropoutGrp.append("circle")
        .classed('selectable', true)
        .attr("cx", 30)
        .attr("cy", neuronY)
        .attr("r", neuronRadius)
        .style("fill", "#FF5733");

      if (i % 2 === 1) { // Cross out every second neuron
        dropoutGrp.append("line")
          .classed('untouchable', true)
          .attr("x1", 30 - neuronRadius)
          .attr("y1", neuronY - neuronRadius)
          .attr("x2", 30 + neuronRadius)
          .attr("y2", neuronY + neuronRadius)
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        dropoutGrp.append("line")
          .classed('untouchable', true)
          .attr("x1", 30 - neuronRadius)
          .attr("y1", neuronY + neuronRadius)
          .attr("x2", 30 + neuronRadius)
          .attr("y2", neuronY - neuronRadius)
          .attr("stroke", "black")
          .attr("stroke-width", 2);
      }
    }

    this.addInputAnchor(dropoutGrp);
    this.addOutputAnchor(dropoutGrp);
    return dropoutGrp;
  }

}
