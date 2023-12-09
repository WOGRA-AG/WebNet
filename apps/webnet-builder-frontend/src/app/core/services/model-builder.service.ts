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
import {Builder} from "../interfaces/project";
import {XY} from "../interfaces/interfaces";
import {Lstm} from "../../shared/layer/lstm";
import {Dropout} from "../../shared/layer/dropout";
import {MatDialog} from "@angular/material/dialog";


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

  async clearModelBuilder(): Promise<void> {
    this.isInitialized = false;
    await this.initialize({layers: [{type: LayerType.Input}, {type: LayerType.Output}], connections: []});
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

  async initialize(builder?: any): Promise<void> {
    this.setupSvg();
    // todo: set different backends?
    await tf.ready();
    if (!this.isInitialized) {
      this.clearLayers();
      this.isInitialized = true;
      this.nextLayerId = builder.nextLayerId;
      this.loadFromBuilder(builder);
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

  createLayer(options: { layerId?:string,  layerType: LayerType, parameters?: any, position?: any }): void {
    const id = options.layerId ? options.layerId : this.generateLayerId();
    let layer;
    switch (options.layerType) {
      case LayerType.Input:
        const inputPosition = this.getInputOutputPosition();
        layer = new Input(id, options.parameters ?? {shape: '1'},
          options.position ?? {x: 30, y: inputPosition.y},
          this, this.fb);
        this.inputLayer = layer;
        break;
      case LayerType.Dense:
        layer = new Dense(id,options.parameters ?? {units: 32, activation: 'relu'},
          options.position ?? {x: 300, y: 160},
          this, this.fb);
        break;
      case LayerType.Dropout:
        layer = new Dropout(id,options.parameters ?? {rate: 0.5},
          options.position ?? {x: 350, y: 160},
          this, this.fb);
        break;
      case LayerType.Convolution:
        layer = new Convolution(id,options.parameters ??
          {filters: 3, kernelSize: 2, strides: 1, padding: 'valid', activation: 'relu'},
          options.position ?? {x: 400, y: 160},
          this, this.fb);
        break;
      case LayerType.Flatten:
        layer = new Flatten(id,options.parameters ?? {},
          options.position ?? {x: 450, y: 160},
          this, this.fb);
        break;
      case LayerType.Maxpooling:
        layer = new Maxpooling(id,options.parameters ?? {
          padding: 'valid',
          strides: 2,
          poolSize: 2,
        },
          options.position ?? {x: 500, y: 160},
          this, this.fb);
        break;
      case LayerType.Lstm:
        layer = new Lstm(id,options.parameters ?? {units: 1, activation: 'tanh', recurrentActivation: 'hardSigmoid'},
          options.position ?? {x: 550, y: 160},
          this, this.fb);
        break;
      case LayerType.Output:
        const outputPosition = this.getInputOutputPosition();
        layer = new Output(id,options.parameters ?? {units: 1, activation: 'sigmoid'},
          options.position ?? {x: outputPosition.x, y: outputPosition.y},
          this, this.fb);
        this.outputLayer = layer;
        break;
    }
    this.layerMap.set(id, layer);
  }

  private getContainerWidthAndHeight(): { width: number, height: number } {
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;
    return {width: svgWidth, height: svgHeight};
  }

  private getInputOutputPosition(): XY {
    const {width, height} = this.getContainerWidthAndHeight();
    const x: number = width - 145;
    const y: number = height / 2 - 75;
    return {x: x, y: y};
  }

  generateBuilderJSON(): Builder {
    const layers = [];
    const connections = [];
    for (const [id, layer] of this.layerMap) {
      const layerInfo = {
        id: id,
        type: layer.getLayerType(),
        parameters: layer.getBuilderParams(),
        position: layer.getSvgPosition()
      };
      layers.push(layerInfo);

      const connection = layer.getOutputConnection()?.getConnectionIds();
      if (connection) {
        connections.push(connection);
      }
    }
    return {layers: layers, connections: connections, nextLayerId: this.nextLayerId};
    // todo:
    // training parameter -> other file?
    // zoom lvl?
  }

  loadFromBuilder(builder: any): void {
    for (const layer of builder.layers) {
      this.createLayer({layerId: layer.id, layerType: layer.type, parameters: layer.parameters, position: layer.position})
    }

    for (const connection of builder.connections) {
      const source = this.layerMap.get(connection.source);
      const destination = this.layerMap.get(connection.destination);
      if (source && destination) {
        this.createConnection(source, destination);
      }
    }
  }

  getDataInputShape(): number[] {
    const shape = this.inputLayer?.getShape();
    return shape ? shape : [];
  }

  async generateModel(useExistingWeights: boolean = true): Promise<LayersModel | null> {
    try {
      await tf.ready();
      const input = this.inputLayer?.tfjsLayer(this.inputLayer?.getModelParameters());

      let layer: Layer | null | undefined = this.inputLayer;
      let hidden = input;
      while (layer?.getNextLayer()) {
        const nextLayer = layer?.getNextLayer();
        const parameters = nextLayer?.getModelParameters(useExistingWeights);
        hidden = nextLayer?.tfjsLayer(parameters).apply(hidden);
        layer = nextLayer;
      }
      return layer !== this.outputLayer ? null : tf.model({inputs: input, outputs: hidden});
    } catch (error) {
      console.log("Error: Generating Model");
      return null;
    }
  }

  generateLayerId(): string {
    return `layer-${this.nextLayerId++}`;
  }

  updateWeights(model: tf.LayersModel): Builder {
    this.layerMap.forEach((layer) => {
      const layerWeights = model.getLayer(layer.getLayerId()).getWeights();
      if (layerWeights) {
        if (layerWeights.length === 2) {
          const [weights, bias] =
            layerWeights.map(weight => {
              return {values: Object.values(weight.dataSync()), shape: weight.shape}
            });
          layer.updateWeights({weights: weights, bias: bias});
        } else if (layerWeights.length === 3) {
          const [weights, recurrentWeights, bias] =
            layerWeights.map(weight => {
              return {values: Object.values(weight.dataSync()), shape: weight.shape}
            });
          layer.updateWeights({weights: weights, recurrentWeights: recurrentWeights, bias: bias});
        }
      }
    });
    return this.generateBuilderJSON();
  }

  clearLayers(): void {
    this.layerMap.forEach((layer) => layer.delete());
    this.layerMap.clear();
  }

  private redrawLayers(): void {
    this.layerMap.forEach((layer) => layer.draw());
  }
}
