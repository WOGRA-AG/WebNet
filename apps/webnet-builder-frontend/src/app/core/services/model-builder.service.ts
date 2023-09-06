import {Injectable} from '@angular/core';
import {Layer} from "../../shared/layer";
import * as tf from "@tensorflow/tfjs";
import {BehaviorSubject, Observable} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ModelBuilderService {
  layerList: Layer[] = [];
  selectedLayer: Layer | null = null;
  selectedLayerSubject: BehaviorSubject<Layer | null> = new BehaviorSubject<Layer | null>(null);

  constructor() {
    this.selectedLayerSubject.subscribe((layer) => {
      this.selectedLayer?.unselect();
      this.selectedLayer = layer;
    })
  }

  addToLayerList(layer: Layer) {
    this.layerList.push(layer);
  }

  getLayers() {
    return this.layerList;
  }

  clearLayerList() {
    this.layerList = [];
    return this.layerList;
  }

  getSelectedLayer() {
    return this.selectedLayer;
  }

  async printModelSummary() {
    await tf.ready();
    const input = tf.input({shape: [32]});
    const hidden = this.layerList[0].getLayer()(this.layerList[0].getParameters()).apply(input);
    // for (let i = 1; i < this.elementList.length; i++) {
    //   this.elementList[i].getLayer()(this.elementList[i].getParameters()).apply(this.element)
    // }
    const model = tf.model({inputs: input, outputs: hidden});
    console.log(model.summary());
  }
}
