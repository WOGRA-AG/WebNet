import * as tf from "@tensorflow/tfjs";
import {Layer} from "../layer";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import * as d3 from "d3";
import {NonNullableFormBuilder, Validators} from "@angular/forms";
import {Weights, XY} from "../../core/interfaces/interfaces";
import {LayerType} from "../../core/enums";
import {Padding, PoolSize, Strides} from "../configuration";

export class Maxpooling extends Layer {
  override layerType = LayerType.Maxpooling;

  constructor(id: string, parameters: {
    padding: string,
    strides: number,
    poolSize: number,
    weights: Weights
  }, position: XY, modelBuilderService: ModelBuilderService, fb: NonNullableFormBuilder) {
    const config = {
      name: 'MaxPooling',
      title: 'MaxPooling Layer Parameter',
      formConfig: [Padding, Strides, PoolSize]
    };
    const layerForm = fb.group({
      poolSize: [parameters.poolSize, [Validators.required]],
      strides: [parameters.strides, [Validators.required]],
      padding: [parameters.padding, [Validators.required]],
    })
    super(id, tf.layers.maxPooling2d, position, config, modelBuilderService, layerForm, parameters?.weights);
  }

  protected override createLayer() {
    const maxPoolData = {name: "MaxPooling", poolSize: 2};

    const maxPoolGrp = d3.select("#inner-svg-container").append("g")
      .classed("layer-group", true)
      .attr("stroke", "black")
      .attr("transform", `translate(${this.position.x}, ${this.position.y})`);

    maxPoolGrp.append("rect")
      .classed('layer', true)
      .classed('selectable', true)
      .attr("width", 140)
      .attr("height", 100)
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", "#33A3FF");

    maxPoolGrp.append("text")
      .classed('layer-title', true)
      .classed('untouchable', true)
      .attr("x", 70)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .text(maxPoolData.name);

    const poolSize = maxPoolData.poolSize;
    const poolMargin = 30;
    const poolX = 70 - ((poolSize - 1) * poolMargin) / 2;
    const poolY = 50 - ((poolSize - 1) * poolMargin) / 2;

    const rectangleSize = 30;

    const colors = ["#FF5733", "#33FF57", "#5733FF", "#FF33FF"];

    for (let i = 0; i < poolSize; i++) {
      for (let j = 0; j < poolSize; j++) {
        const x = poolX + i * poolMargin - rectangleSize / 2;
        const y = poolY + j * poolMargin - rectangleSize / 2;

        maxPoolGrp.append("rect")
          .classed('selectable', true)
          .attr("x", x)
          .attr("y", y)
          .attr("width", rectangleSize)
          .attr("height", rectangleSize)
          .style("fill", colors[i * poolSize + j]);
      }
    }

    this.addInputAnchor(maxPoolGrp);
    this.addOutputAnchor(maxPoolGrp);
    return maxPoolGrp;
  }
}
