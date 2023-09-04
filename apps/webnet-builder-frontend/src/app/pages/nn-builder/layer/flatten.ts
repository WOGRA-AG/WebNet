import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";


export class Flatten extends Layer {
  public override readonly tfjsLayer: any = tf.layers.flatten;
  public override readonly parameters: any = {shape: [4, 3]};
  constructor() {
    super(tf.layers.flatten, {layerName: "Flatten", color: "#69a3b2"} );
  }
}
