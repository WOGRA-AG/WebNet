import {Injectable} from '@angular/core';
import {Layer} from "../../shared/layer";
import * as tf from "@tensorflow/tfjs";
import {BehaviorSubject} from "rxjs";
import {Connection} from "../../shared/connection";
import {Input} from "../../shared/layer/input";
import {Output} from "../../shared/layer/output";
import {Selection} from "d3";
import * as d3 from "d3";
import {LayersModel} from "@tensorflow/tfjs";
import {NonNullableFormBuilder} from "@angular/forms";


@Injectable({
  providedIn: 'root'
})
export class ModelBuilderService {
  private layerMap: Map<string, Layer> = new Map();
  private nextLayerId = 1;
  inputLayer: Input | null = null;
  outputLayer: Output | null = null;
  selectedLayer: Layer | null = null;
  activeConnection: Connection | null = null;
  selectedLayerSubject: BehaviorSubject<Layer | null> = new BehaviorSubject<Layer | null>(null);
  activeConnectionSubject: BehaviorSubject<Connection | null> = new BehaviorSubject<Connection | null>(null);
  isInitialized = false;

  constructor(protected fb: NonNullableFormBuilder) {
    this.selectedLayerSubject.subscribe((layer) => {
      this.selectedLayer?.unselect();
      this.selectedLayer = layer;
    });
    this.activeConnectionSubject.subscribe((connection) => {
      this.activeConnection = connection;
    })
  }

  getSelectedLayer() {
    return this.selectedLayer;
  }

  clearModelBuilder(): void {
    this.isInitialized = false;
    this.deleteAllLayers();
    this.layerMap.clear();
    this.initialize();
  }

  setupSvg(): void {
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;

    svg
      .on("click", (event: any) => this.unselect(event))
      .call(
        d3.zoom().scaleExtent([0.4, 1.1])
          .translateExtent([[-svgWidth, -svgHeight], [2 * svgWidth, 2 * svgHeight]])
          .on('zoom', (event: any) => {
            d3.select("#inner-svg-container").attr('transform', event.transform);
          })
      );
  }

  initialize(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.nextLayerId = 1;
      this.createInputAndOutputLayer();
    } else {
      this.redrawLayers();
    }
  }

  unselect(event: any): void {
    event.stopPropagation();
    this.selectedLayerSubject.next(null);
  }

  deleteSelectedLayer(event: any): void {
    event.stopPropagation();
    if (this.selectedLayer != this.inputLayer && this.selectedLayer != this.outputLayer) {
      this.layerMap.delete(this.selectedLayer?.getLayerId()!);
      this.selectedLayer?.delete();
      this.selectedLayerSubject.next(null);
    }
  }


  addToLayerList(layer: Layer): void {
    const id = layer.getLayerId();
    this.layerMap.set(id, layer);
  }

  async generateModel(): Promise<LayersModel|null> {
    try {
      await tf.ready();
      const input = this.inputLayer?.tfjsLayer(this.inputLayer?.getParameters());

      let layer: Layer | null | undefined = this.inputLayer;
      let hidden = input;

      while (layer?.getNextLayer()) {
        const nextLayer = layer?.getNextLayer();
        hidden = nextLayer?.tfjsLayer(nextLayer?.getParameters()).apply(hidden);
        layer = nextLayer;
      }

      return layer !== this.outputLayer ? null : tf.model({inputs: input, outputs: hidden});
    } catch (error) {
      console.log("Error: Generating Model");
      return null;
    }
  }

  async isModelReady(): Promise<boolean> {
    const model = await this.generateModel();
    console.log(model);
    return model ? true : false;
  }

  generateLayerId(): string {
    return `layer-${this.nextLayerId++}`;
  }

  private createInputAndOutputLayer(): void {
    this.inputLayer = new Input(this, this.fb);
    this.outputLayer = new Output(this, this.fb);
    this.layerMap.set(this.inputLayer.getLayerId(), this.inputLayer);
    this.layerMap.set(this.outputLayer.getLayerId(), this.outputLayer);
  }

  private deleteAllLayers(): void {
    this.layerMap.forEach((layer) => {
      layer.delete();
    });
  }

  private redrawLayers(): void {
    this.layerMap.forEach((layer) => {
      layer.draw();
    });
  }
}
