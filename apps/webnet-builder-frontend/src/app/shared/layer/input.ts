import * as d3 from "d3";
import { Selection } from "d3";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {NonNullableFormBuilder} from "@angular/forms";
import {validateShapeArray} from "../../core/validators";
import {parseShapeString} from "../utils";

export class Input extends Layer{

  constructor(modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Input',
      title: 'Input Layer Parameter',
      formConfig: [{
        key: 'shape',
        label: 'Shape',
        controlType: 'textbox',
        type: 'text',
        tooltip: 'A shape, not including the batch size. For instance, shape=[32] indicates that the expected input will be batches of 32-dimensional vectors.',
      }]
    };
    const layerForm = fb.group({
      shape: ['16', [validateShapeArray]]
    });
    super(tf.input, config, modelBuilderService, fb, layerForm);
  }

  override getParameters(): any {
    const parameter = this.layerForm.getRawValue();
    parameter.shape = parseShapeString(parameter.shape);
    return parameter;
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const inputData = { name: "Input", shape: [64, 64, 3] };
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgHeight = svg.node().getBoundingClientRect().height;
    const inputGrp = d3.select("#inner-svg-container")
      .append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(30, ${svgHeight / 2 - 75})`);

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
