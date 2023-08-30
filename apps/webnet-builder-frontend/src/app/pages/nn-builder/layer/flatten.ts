import * as tf from "@tensorflow/tfjs";
import {Layer} from "./layer";


export class Flatten extends Layer {
  public readonly tfLayer: any = tf.layers.flatten;

  constructor() {
    super({layerName: "Flatten", color: "green"} );
  }


}
