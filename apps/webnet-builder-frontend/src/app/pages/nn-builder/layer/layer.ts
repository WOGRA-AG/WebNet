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
    this.svgElement.style("cursor", "pointer").select("rect").attr("stroke", "red").attr("stroke-width", 1);
  }

  mouseLeave(event: any) {
    this.svgElement.style("cursor", "default").select("rect").attr('stroke', 'black').attr("stroke-width", 1);
  }

  selected(event: any) {
    event.stopPropagation();
    this.svgElement.raise().select("rect").style("fill", "lightgray");
    this.modelBuilderService.selectedLayerSubject.next(this);
  }

  unselect() {
    this.svgElement.select("rect").style("fill", "RED");
  }

  dragStarted(event: any) {
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

    const x = Math.max(minX, Math.min(maxX, event.x));
    const y = Math.max(minY, Math.min(maxY, event.y));

    this.svgElement.attr("transform", `translate(${x},${y})`);
  }

  dragEnded(event: any) {
  }

  getConfiguration() {
    return this.configuration;
  }

  createLayer(): Selection<any, any, any, any> {
    const layerGrp = d3.select("#inner-svg-container")
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
  addInputAnchor(layerGrp: Selection<any, any, any, any>) {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild("rect");
    const circleX = -10;
    const circleY = layerRect.node().getBBox().height / 2;

    const leftAnchorGroup = layerGrp.append("g")
      .classed("anchor-group", true)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    leftAnchorGroup.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .style("fill", "red")
  }

  addOutputAnchor(layerGrp: Selection<any, any, any, any>) {
    const layerRect: Selection<any, any, any, any> = layerGrp.selectChild("rect");
    const circleX = layerRect.node().getBBox().width + 10;
    const circleY = layerRect.node().getBBox().height / 2;

    const rightAnchorGroup: Selection<any, any, any, any> = layerGrp.append("g")
      .classed("anchor-group", true)
      .attr("transform", `translate(${circleX}, ${circleY})`);

    rightAnchorGroup.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .style("fill", "blue")

    rightAnchorGroup.call(d3.drag()
      .on("start", (event: any) => console.log("drag started"))
      .on("drag", (event: any) => console.log("drag dragged"))
      .on("end", (event: any) => console.log("drag ended")))
      .on("click", (event: any) => console.log("create line"))
      .on("mouseenter", (event: any) => rightAnchorGroup.style("cursor", "crosshair"))
      .on("mouseleave", (event: any) => rightAnchorGroup.style("cursor", "default"));
  }
}
