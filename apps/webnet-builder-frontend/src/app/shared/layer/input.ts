import * as d3 from "d3";
import { Selection } from "d3";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {NonNullableFormBuilder} from "@angular/forms";
import {validateShapeArray} from "../../core/validators";
import {parseShapeString} from "../utils";
import {Shape} from "../configuration";
import {XY} from "../../core/interfaces/interfaces";
import {LayerType} from "../../core/enums";

export class Input extends Layer{
  override layerType = LayerType.Input;
  constructor(id: string, parameters: {shape: string}, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'Input',
      title: 'Input Layer Parameter',
      formConfig: [
        Shape
      ]
    };
    const layerForm = fb.group({
      shape: [parameters.shape, [validateShapeArray]]
    });
    super(id, tf.input, position, config, modelBuilderService, layerForm);
  }

  override getModelParameters(): any {
    const parameters = this.layerForm.getRawValue();
    if (typeof parameters.shape === 'string') {
      parameters.shape = parseShapeString(parameters.shape);
    }
    parameters.name = this.getLayerId();
    return parameters;
  }

  getShape(): null|number[] {
    const shape = this.layerForm.get('shape')?.value;
    return parseShapeString(shape);
  }

  protected override createLayer(): Selection<any, any, any, any> {
    const inputData = { name: "Input", shape: [64, 64, 3] };
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgHeight = svg.node().getBoundingClientRect().height;
    const inputGrp = d3.select("#inner-svg-container")
      .append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${svgHeight / 2 - 75})`);

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

    // inputGrp.append("text")
    //   .attr("x", 30)
    //   .attr("y", 30)
    //   .attr("text-anchor", "middle")
    //   .text(`Shape: [${inputData.shape.join(", ")}]`)
    //   .style("font-size", "10px");

    this.addOutputAnchor(inputGrp);
    return inputGrp;
  }

}
