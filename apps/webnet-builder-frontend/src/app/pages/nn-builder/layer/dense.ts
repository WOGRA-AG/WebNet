import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";


export class Dense extends Layer {
  public override readonly tfjsLayer: any = tf.layers.dense;
  public override readonly parameters: any = {units: 500, activation: 'softmax'};

  constructor() {
    super(tf.layers.dense, {layerName: "Dense", color: "red"} );
  }

}
