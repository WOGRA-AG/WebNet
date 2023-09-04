import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {model} from "@tensorflow/tfjs";


export class Dense extends Layer {
  public override readonly tfjsLayer: any = tf.layers.dense;
  public override readonly parameters: any = {units: 500, activation: 'softmax'};

  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.dense, {layerName: "Dense", fillColor: "red"}, modelBuilderService);
  }

}
