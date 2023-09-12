import * as d3 from "d3";
import {Selection} from "d3";
import {ModelBuilderService} from "../core/services/model-builder.service";
import {Connection} from "./connection";
import {getTransformPosition} from "./utils";
import {XY} from "../core/interfaces";

export class Layer {
  protected svgElement: Selection<any, any, any, any>;
  protected outputAnchor: Connection|null = null;
  protected inputAnchor: Connection | null = null;
  protected mousePositionOnElement: XY = {x: 0, y: 0};
  protected configuration: any;
  protected tfjsLayer: any;

  constructor(
    tfjsLayer: any,
    configuration: any,
    protected modelBuilderService: ModelBuilderService) {
    this.tfjsLayer = tfjsLayer;
    this.configuration = configuration

    this.svgElement = this.createLayer();

    // add dragable events to the svg element
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
      .on("mouseenter", (event: any) => this.mouseEnter(event))
      .on("mouseleave", (event: any) => this.mouseLeave(event));
  }

  getLayer() {
    return this.tfjsLayer;
  }

  getParameters() {
    return this.configuration.parameters;
  }

  mouseEnter(event: any) {
    this.svgElement.classed("hovered", true);
  }

  mouseLeave(event: any) {
    this.svgElement.classed("hovered", false);
  }

  selected(event: any) {
    event.stopPropagation();
    event.preventDefault();
    this.svgElement.classed("selected", true).raise();
    this.modelBuilderService.selectedLayerSubject.next(this);
  }

  unselect() {
    this.svgElement.classed("selected", false);
  }

  dragStarted(event: any) {
    const position = d3.pointer(event);
    this.mousePositionOnElement = {x: position[0], y: position[1]};
    // this.svgElement.raise();
  }

  dragging(event: any) {
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
    if (this.outputAnchor) {
      this.outputAnchor.updateSourcePosition();
    }
  }

  dragEnded(event: any) {
  }

  getConfiguration() {
    return this.configuration;
  }

  createLayer(): Selection<any, any, any, any> {
    const layerGrp = d3.select("#inner-svg-container")
      .append('g')
      .classed('layer-group', true)
      .attr('stroke', 'yellow')
      .attr('fill', 'black');

    layerGrp.append('rect')
      .classed('layer', true)
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 20)
      .attr('height', 100)

    layerGrp.append('text')
      .classed('layer-title', true)
      .attr('x', 50 - 10)
      .attr('y', 50 - 20 / 2)
      .text("Default Layer");
    return layerGrp;
  }

  addInputAnchor(layerGrp: Selection<any, any, any, any>) {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild(".layer");
    const circleX = -10;
    const circleY = layerRect.node().getBBox().height / 2;

    const inputAnchor = layerGrp.append("circle")
      .classed("input-anchor-group", true)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    inputAnchor.on("mouseenter", (event: any) => inputAnchor.classed("hovered", true))
      .on("mouseleave", (event: any) => inputAnchor.classed("hovered", false));
  }

  addOutputAnchor(layerGrp: Selection<any, any, any, any>) {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild("rect");
    const circleX = layerRect.node().getBBox().width + 10;
    const circleY = layerRect.node().getBBox().height / 2;

    const outputAnchor: Selection<any, any, any, any> = layerGrp.append("circle")
      .classed("output-anchor-group", true)
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    outputAnchor.call(d3.drag()
      .on("start", (event: any) => {
        this.outputAnchor = new Connection(this);
        outputAnchor.classed("dragged", true);
      })
      .on("drag", (event: any) => this.outputAnchor?.moveToMouse(event))
      .on("end", (event: any) => {
        outputAnchor.classed("dragged", false);
        this.outputAnchor?.removeConnection();
      }))
      // .on("mousedown", (event: any) => {
      //   this.outputAnchor = new Connection(this);
      //   outputAnchor.selectChild(".output-anchor-group").style("fill", "yellow");
      // })
      // .on("mousemove", (event: any) => {
      //   console.log(event);
      //   this.outputAnchor?.moveToMouse(event)
      // })
      .on("mouseenter", (event: any) => outputAnchor.classed("hovered", true))
      .on("mouseleave", (event: any) => outputAnchor.classed("hovered", false));
  }

  getSvgPosition() {
    const transformAttr = this.svgElement.attr("transform");
    const svgPos = getTransformPosition(transformAttr);
    return {x: svgPos.x, y: svgPos.y};
  }

  getOutputAnchorPosition() {
    const svgPos = this.getSvgPosition();
    const transformAttr = this.svgElement.selectChild('.output-anchor-group').attr("transform");
    const anchorPos = getTransformPosition(transformAttr);
    return {x: svgPos.x + anchorPos.x, y: svgPos.y + anchorPos.y}
  }
}
