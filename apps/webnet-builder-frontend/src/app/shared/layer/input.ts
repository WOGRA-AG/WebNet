import * as d3 from "d3";
import { Selection } from "d3";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {FormBuilder} from "@angular/forms";

export class Input extends Layer{

  constructor(modelBuilderService: ModelBuilderService, fb: FormBuilder) {
    const config = {
      name: 'Input',
      title: 'Dense Layer Parameter',
      parameters: {
        units: 5,
        activation: 'softmax',
      },
      formConfig: [{
        key: 'units',
        title: 'Dense Layer Parameter',
        label: 'Units',
        controlType: 'textbox',
        required: true,
        value: 5,
        type: 'number'
      }]
    }
    super(tf.layers.input, config, modelBuilderService, fb);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const inputData = { name: "Input", shape: [64, 64, 3] };

    const inputGrp = d3.select("#inner-svg-container")
      .append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", "translate(30, 200)");

    inputGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 60)
      .attr("height", 150)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33FF57");

    inputGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
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

    this.addOutputAnchor(inputGrp);
    return inputGrp;
  }

}
