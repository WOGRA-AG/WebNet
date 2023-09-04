import * as d3 from "d3";
import {Selection} from "d3";
import {ModelBuilderService} from "../../../core/services/model-builder.service";

export class Layer {
  svgElement: Selection<any, any, any, any>;
  protected configuration: any;
  protected tfjsLayer: any;

  constructor(
    tfjsLayer: any,
    configuration: any,
    protected modelBuilderService: ModelBuilderService) {
    this.tfjsLayer = tfjsLayer;
    this.configuration = configuration

    this.svgElement = this.createLayer();

    this.svgElement.call(d3.drag<SVGElement, any, any>()
      .on("start", (event: any) => this.dragStarted(event))
      .on("drag", (event: any) => this.dragging(event))
      .on("end", (event: any) => this.dragEnded(event)))
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
    this.svgElement.style("cursor", "pointer").select("rect").style("fill", "lightgray");
  }

  mouseLeave(event: any) {
    this.svgElement.style("cursor", "default").select("rect").style("fill", "RED");
  }

  selected(event: any) {
    event.stopPropagation();
    this.modelBuilderService.selectedLayerSubject.next(this);
    this.svgElement.select("rect").attr("stroke", "red");
  }

  unselect() {
    this.svgElement.select("rect").attr('stroke', 'black');
  }

  dragStarted(event: any) {
  }

  dragging(event: any) {
    this.svgElement.attr("transform", `translate(${event.x},${event.y})`);
  }

  dragEnded(event: any) {
  }

  getConfiguration() {
    return this.configuration;
  }

  createLayer(): Selection<any, any, any, any> {
    const layerGrp = d3.select("#svg-container")
      .append('g')
      .classed('layerGroup', true)
      .attr('stroke', 'yellow')
      .attr('fill', 'black');

    layerGrp.append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 20)
      .attr('height', 100)


    layerGrp.append('text')
      .attr('x', 50 - 10)
      .attr('y', 50 - 20 / 2)
      .text("Layer");
    return layerGrp;
  }

}
