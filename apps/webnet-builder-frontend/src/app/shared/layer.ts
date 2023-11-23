import * as d3 from "d3";
import {Selection} from "d3";
import {ModelBuilderService} from "../core/services/model-builder.service";
import {Connection} from "./connection";
import {getTransformPosition} from "./utils";
import {Weights, XY} from "../core/interfaces/interfaces";
import {FormGroup} from "@angular/forms";
import * as tf from "@tensorflow/tfjs";

export abstract class Layer {
  private readonly layerId: string;
  protected abstract layerType: string;
  protected svgElement: Selection<any, any, any, any>;
  protected outputConnection: Connection | null = null;
  protected inputConnection: Connection | null = null;
  protected mousePositionOnElement: XY = {x: 0, y: 0};
  protected configuration: any;
  public layerForm: FormGroup;
  public tfjsLayer: any;
  protected position: XY;
  protected weights: Weights | null;

  protected constructor(
    id: string,
    tfjsLayer: any,
    position: XY,
    configuration: any,
    protected modelBuilderService: ModelBuilderService,
    layerForm: FormGroup,
    weights?: Weights) {
    this.layerId = id;
    this.position = position;
    this.tfjsLayer = tfjsLayer;
    this.configuration = configuration
    this.layerForm = layerForm;
    this.svgElement = this.createLayer();
    this.svgElement.call(d3.drag<SVGElement, any, any>()
      .on("start", (event: any) => this.dragStarted(event))
      .on("drag", (event: any) => this.dragging(event))
      .on("end", (event: any) => this.dragEnded(event)));

    // remove drag events from untouchable children
    this.svgElement.selectChildren<SVGElement, any>('.untouchable')
      .call(d3.drag<SVGElement, any, any>().on('.drag', null));

    // add event listeners to selectable children
    this.svgElement.selectChildren('.selectable')
      .on("click", (event: any) => this.selected(event))
      .on("mouseenter", (event: any) => this.hoverLayer(event))
      .on("mouseleave", (event: any) => this.unhoverLayer(event));

    this.configuration.name = this.getLayerId();
    this.weights = weights ? weights : null;
  }

  getOutputConnection(): Connection | null {
    return this.outputConnection;
  }

  updateWeights(weights: Weights): void {
    this.weights = weights;
  }

  getBuilderParams(): any {
    const parameters = this.layerForm.getRawValue();
    parameters.name = this.getLayerId();

    if (this.weights && Object.keys(this.weights).length > 0) {
      const weights = this.weights.weights;
      const bias = this.weights.bias;
      const recurrentWeights = this.weights.recurrentWeights;
      parameters.weights = recurrentWeights ? {
        weights: weights,
        recurrentWeights: recurrentWeights,
        bias: bias
      } : {weights: weights, bias: bias};
    }
    return parameters;
  }

  getModelParameters(useExistingWeights: boolean = true): any {
    const parameters = this.layerForm.getRawValue();
    parameters.name = this.getLayerId();

    if (this.weights && useExistingWeights) {
      const weights = this.weights.weights;
      const bias = this.weights.bias;
      const recurrentWeights = this.weights.recurrentWeights;
      parameters.weights = recurrentWeights ? [
        tf.tensor(weights.values, weights.shape),
        tf.tensor(recurrentWeights.values, recurrentWeights.shape),
        tf.tensor(bias.values, bias.shape)
      ] : [
        tf.tensor(weights.values, weights.shape),
        tf.tensor(bias.values, bias.shape)
      ];
    }
    return parameters;
  };

  getLayerType(): string {
    return this.layerType;
  }

  getLayerId(): string {
    return this.layerId;
  }

  getConfiguration(): any {
    return this.configuration;
  }

  getNextLayer(): Layer | null | undefined {
    return this.outputConnection?.getDestinationLayer();
  }

  getSvgPosition(): XY {
    const transformAttr = this.svgElement.attr("transform");
    const svgPos = getTransformPosition(transformAttr);
    return {x: svgPos.x, y: svgPos.y};
  }

  getOutputAnchorPosition(): XY {
    const svgPos = this.getSvgPosition();
    const transformAttr = this.svgElement.selectChild('.output-anchor-group').attr("transform");
    const anchorPos = getTransformPosition(transformAttr);
    return {x: svgPos.x + anchorPos.x, y: svgPos.y + anchorPos.y}
  }

  getInputAnchorPosition(): XY {
    const svgPos = this.getSvgPosition();
    const transformAttr = this.svgElement.selectChild('.input-anchor-group').attr("transform");
    const anchorPos = getTransformPosition(transformAttr);
    return {x: svgPos.x + anchorPos.x, y: svgPos.y + anchorPos.y}
  }

  selected(event: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.svgElement.classed("selected", true).raise();
    this.modelBuilderService.selectedLayerSubject.next(this);
  }

  draw(): void {
    d3.select("#inner-svg-container").append(() => this.svgElement.node());
    this.outputConnection?.draw();
  }

  unselect(): void {
    this.svgElement.classed("selected", false);
  }

  delete(): void {
    this.outputConnection?.removeConnection();
    this.inputConnection?.removeConnection();
    this.svgElement.remove();
  }

  removeOutputConnection(): void {
    this.outputConnection = null;
  }

  removeInputConnection(): void {
    this.inputConnection = null;
  }

  protected abstract createLayer(): Selection<any, any, any, any>

  protected addInputAnchor(layerGrp: Selection<any, any, any, any>): void {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild(".layer");

    const circleX = -10;
    const circleY = layerRect.node().getBBox().height / 2;

    const inputAnchor = layerGrp.append("circle")
      .classed("input-anchor-group", true)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    inputAnchor
      .on("mouseenter", (event: any) => inputAnchor.classed("hovered", true))
      .on("mouseleave", (event: any) => this.addConnection());
  }

  protected addOutputAnchor(layerGrp: Selection<any, any, any, any>): void {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild(".layer");
    const circleX = layerRect.node().getBBox().width + 10;
    const circleY = layerRect.node().getBBox().height / 2;

    const outputAnchor: Selection<any, any, any, any> = layerGrp.append("circle")
      .classed("output-anchor-group", true)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    outputAnchor.call(d3.drag()
      .on("start", (event: any) => this.createConnection())
      .on("drag", (event: any) => this.outputConnection?.moveToMouse(event))
      .on("end", (event: any) => this.checkConnection(outputAnchor, event)))
      .on("mouseenter", (event: any) => outputAnchor.classed("hovered", true))
      .on("mouseleave", (event: any) => outputAnchor.classed("hovered", false));
  }

  createConnection(): void {
    if (this.outputConnection) {
      this.outputConnection.removeConnection()
    }
    this.outputConnection = new Connection(this, null);
    this.svgElement.select('.output-anchor-group').classed("dragged", true);
  }

  protected checkConnection(outputAnchor: Selection<any, any, any, any>, event: any): void {
    outputAnchor.classed("dragged", false);
    const elementsUnderMouse = document.elementsFromPoint(event.sourceEvent.clientX, event.sourceEvent.clientY);
    const destinationInputAnchor = elementsUnderMouse.find((element) => element.classList.contains("input-anchor-group"));
    if (destinationInputAnchor) {
      this.modelBuilderService.activeConnectionSubject.next(this.outputConnection);
    } else {
      this.outputConnection?.removeConnection();
    }
  }

  protected addConnection(): void {
    this.svgElement.select('.input-anchor-group').classed("hovered", false);
    const connection = this.modelBuilderService.activeConnection;
    if (connection) {
      if (this.inputConnection) {
        this.inputConnection.removeConnection();
      }
      this.inputConnection = connection;
      this.inputConnection = this.inputConnection?.connectWithDestinationLayer(this)!;
      this.modelBuilderService.activeConnectionSubject.next(null);
    }
  }

  addOutputConnection(connection: Connection): void {
    this.outputConnection = connection;
  }

  addInputConnection(connection: Connection): void {
    this.inputConnection = connection;
  }

  protected hoverLayer(event: any): void {
    this.svgElement.classed("hovered", true);
  }

  protected unhoverLayer(event: any): void {
    this.svgElement.classed("hovered", false);
  }

  protected dragStarted(event: any): void {
    const position = d3.pointer(event);
    this.mousePositionOnElement = {x: position[0], y: position[1]};
  }

  protected dragging(event: any): void {
    const svgContainer: Selection<any, any, any, any> = d3.select("#svg-container");

    const svgWidth = (svgContainer.node() as SVGSVGElement).clientWidth;
    const svgHeight = (svgContainer.node() as SVGSVGElement).clientHeight;

    const elementWidth = this.svgElement.node().getBBox().width;
    const elementHeight = this.svgElement.node().getBBox().height;

    const minX = -svgWidth;
    const minY = -svgHeight;
    const maxX = 2 * svgWidth - elementWidth;
    const maxY = 2 * svgHeight - elementHeight;

    const x = Math.max(minX, Math.min(maxX, event.x)) - this.mousePositionOnElement.x;
    const y = Math.max(minY, Math.min(maxY, event.y)) - this.mousePositionOnElement.y;

    this.svgElement.attr("transform", `translate(${x},${y})`);

    if (this.outputConnection) {
      this.outputConnection.updateSourcePosition();
    }
    if (this.inputConnection) {
      this.inputConnection.updateDestinationPosition();
    }
  }

  protected dragEnded(event: any): void {
    console.log("DRAG ENDED")
  }

}
