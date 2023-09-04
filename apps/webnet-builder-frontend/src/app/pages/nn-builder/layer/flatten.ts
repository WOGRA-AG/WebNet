import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";
import {ModelBuilderService} from "../../../core/services/model-builder.service";


export class Flatten extends Layer {
  public override readonly tfjsLayer: any = tf.layers.flatten;
  public override readonly parameters: any = {shape: [4, 3]};
  constructor(modelBuilderService: ModelBuilderService) {
    super(tf.layers.flatten, {layerName: "Flatten", fillColor: "#69a3b2"},modelBuilderService );
  }
}
