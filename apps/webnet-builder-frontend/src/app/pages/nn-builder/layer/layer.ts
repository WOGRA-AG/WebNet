import {XY} from "../../../core/interfaces";
import * as d3 from "d3";
import {Selection} from "d3";
import {ModelBuilderService} from "../../../core/services/model-builder.service";

export class Layer {
  svgElement: Selection<any, any, any, any>;

  protected tfjsLayer: any;
  protected parameters: any;

  protected layerName: string;
  protected position: XY;

  protected width: number;
  protected height: number;
  protected color: string;
  protected fillColor: string;
  protected namePos: XY;

  // todo:
  // tf.layers.Layer
  constructor(
    tfjsLayer: any,
    {
      layerName = 'layer',
      position = {x: 50, y: 50},
      color = 'black',
      namePos = {x: 0, y: -15},
      width = 20,
      height = 100,
      fillColor = 'black'
    }, private modelBuilderService: ModelBuilderService) {
    this.tfjsLayer = tfjsLayer;
    this.layerName = layerName;
    this.position = position;
    this.width = width;
    this.height = height;
    this.fillColor = fillColor;
    this.color = color;
    this.namePos = namePos;

    // todo:
    // anchor?

    const layerGrp: Selection<any, any, any, any> = d3.select("#svg-container")
      .append('g')
      .classed('layerGroup', true)
      .attr('stroke', this.color)
      .attr('fill', this.fillColor);

    layerGrp.append('rect')
      .attr('x', this.position.x)
      .attr('y', this.position.y)
      .attr('width', this.width)
      .attr('height', this.height)


    layerGrp.append('text')
      .attr('x', this.position.y - 10)
      .attr('y', this.position.x - this.width / 2)
      .text(this.layerName);

    layerGrp.call(d3.drag<SVGElement, any, any>()
      .on("start", (event: any) => this.dragStarted(event))
      .on("drag", (event: any) => this.dragging(event))
      .on("end", (event: any) => this.dragEnded(event)))
      .on("click", (event: any) => this.selected(event));

    this.svgElement = layerGrp;
  }

  getParameters() {
    return this.parameters;
  }

  getLayer() {
    return this.tfjsLayer;
  }

  selected(event: any) {
    event.stopPropagation();
    this.modelBuilderService.selectedLayerSubject.next(this);
    this.svgElement.attr('stroke', 'green');
  }

  unselect() {
    this.svgElement.attr('stroke', this.color);
  }

  dragStarted(event: any) {}

  dragging(event: any) {
    this.svgElement.attr("transform", `translate(${event.x},${event.y})`);
  }

  dragEnded(event: any) {}
}
