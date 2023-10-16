import {Injectable} from '@angular/core';
import {Layer} from "../../shared/layer";
import * as tf from "@tensorflow/tfjs";
import {LayersModel} from "@tensorflow/tfjs";
import {BehaviorSubject} from "rxjs";
import {Connection} from "../../shared/connection";
import {Input} from "../../shared/layer/input";
import {Output} from "../../shared/layer/output";
import * as d3 from "d3";
import {Selection} from "d3";
import {NonNullableFormBuilder} from "@angular/forms";
import {LayerType} from "../enums";
import {Dense} from "../../shared/layer/dense";
import {Convolution} from "../../shared/layer/convolution";
import {Flatten} from "../../shared/layer/flatten";
import {Maxpooling} from "../../shared/layer/maxpooling";


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

  initialize(builder?: any): void {
    if (!this.isInitialized) {
      this.setupSvg();
      this.deleteAllLayers();
      this.isInitialized = true;
      this.nextLayerId = 1;
      builder ? this.loadFromBuilder(builder) : this.createInputAndOutputLayer();
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

  createConnection(source: Layer, destination: Layer): void {
    const connection = new Connection(source, destination);
    source.addOutputConnection(connection);
    destination.addInputConnection(connection)
  }

  createLayer(layerType: LayerType, options?: any): void {
    let layer;
    switch (layerType) {
      case LayerType.Input:
        layer = new Input(options?.position ?? {x: 300, y: 160}, this, this.fb);
        break;
      case LayerType.Dense:
        layer = new Dense(options?.position ?? {x: 300, y: 160}, this, this.fb);
        break;
      case LayerType.Convolution:
        layer = new Convolution(options?.position ?? {x: 600, y: 160}, this, this.fb);
        break;
      case LayerType.Flatten:
        layer = new Flatten(options?.position ?? {x: 500, y: 160}, this, this.fb);
        break;
      case LayerType.Maxpooling:
        layer = new Maxpooling(options?.position ?? {x: 650, y: 160}, this, this.fb);
        break;
      case LayerType.Output:
        layer = new Output(options?.position ?? {x: 300, y: 160}, this, this.fb);
        break;
      default:
        // todo: throw instead error warning to the user
        layer = new Dense(options?.position ?? {x: 300, y: 160}, this, this.fb);
        break;
    }
    const id = layer.getLayerId();
    this.layerMap.set(id, layer);
  }

  generateBuilderJSON() {
    const layers = [];
    const connections = [];
    for (const [id, layer] of this.layerMap) {
      const layerInfo = {
        id: id,
        type: layer.getLayerType(),
        position: layer.getSvgPosition(),
        parameters: layer.getParameters()
      };
      layers.push(layerInfo);

      const connection = layer.getOutputConnection()?.getConnectionIds();
      if (connection) {
        connections.push(connection);
      }
    }
    return JSON.stringify({layers: layers, connections: connections});
    // todo:
    // training parameter -> other file?
    // zoom lvl?
  }

  loadFromBuilder(builder: any): void {
    this.nextLayerId = 1;
    for (const layer of builder.layers) {
      this.createLayer(layer.type, {position: layer.position})
    }

    for (const connection of builder.connections) {
      const source = this.layerMap.get(connection.source);
      const destination = this.layerMap.get(connection.destination);
      if (source && destination) {
        this.createConnection(source, destination);
      }
    }
  }

  async generateModel(): Promise<LayersModel | null> {
    try {
      await tf.ready();
      const input = this.inputLayer?.tfjsLayer(this.inputLayer?.getParameters());

      let layer: Layer | null | undefined = this.inputLayer;
      let hidden = input;

      while (layer?.getNextLayer()) {
        const nextLayer = layer?.getNextLayer();
        const parameters = nextLayer?.getParameters();
        hidden = nextLayer?.tfjsLayer(parameters).apply(hidden);
        layer = nextLayer;
      }

      return layer !== this.outputLayer ? null : tf.model({inputs: input, outputs: hidden});
    } catch (error) {
      console.log("Error: Generating Model");
      console.log(error);
      return null;
    }
  }

  async isModelReady(): Promise<boolean> {
    const model = await this.generateModel();
    return model ? true : false;
  }

  generateLayerId(): string {
    return `layer-${this.nextLayerId++}`;
  }

  private getContainerWidthAndHeight(): { width: number, height: number } {
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;
    return {width: svgWidth, height: svgHeight};
  }

  private createInputAndOutputLayer(): void {
    const {width, height} = this.getContainerWidthAndHeight();
    const x: number = width - 145;
    const y: number = height / 2 - 75;

    this.inputLayer = new Input({x: 30, y: y}, this, this.fb);
    this.outputLayer = new Output({x: x, y: y}, this, this.fb);
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
