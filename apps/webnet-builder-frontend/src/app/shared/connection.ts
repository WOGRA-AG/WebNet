import * as d3 from "d3";
import {Layer} from "./layer";

export class Connection {
  private source: Layer;
  private destination: Layer|null = null;
  private dashedLine: d3.Selection<any, any, any, any>;
  constructor(source: Layer){
    this.source = source;
    const position = this.source.getOutputAnchorPosition();
    this.dashedLine =  d3.select("#inner-svg-container").append<SVGGraphicsElement>("line")
      .classed("connection", true)
      .attr("x1", position.x)
      .attr("y1", position.y)
      .attr("x2", position.x)
      .attr("y2", position.y)
      .lower();
  }

  connectWithDestinationLayer(destinationLayer: Layer): this {
    this.destination = destinationLayer;
    return this;
  }

  getSourceLayer(): Layer {
    return this.source;
  }

  getDestinationLayer(): Layer|null {
    return this.destination;
  }

  moveToMouse(event: any): void {
    const layerPosition = this.source.getSvgPosition();
    this.dashedLine
      .attr("x2", layerPosition.x + event.x)
      .attr("y2", layerPosition.y + event.y);
  }

  updateSourcePosition(): void {
    const anchorPosition = this.source.getOutputAnchorPosition();
    this.dashedLine
      .attr("x1", anchorPosition.x)
      .attr("y1", anchorPosition.y)
      .lower();
  }

  updateDestinationPosition(): void {
    if (this.destination) {
      const anchorPosition = this.destination.getInputAnchorPosition();
      this.dashedLine
        .attr("x2", anchorPosition.x)
        .attr("y2", anchorPosition.y)
        .lower();
    }
  }

  removeConnection(): void {
    this.source.removeOutputConnection();
    this.destination?.removeInputConnection();
    this.dashedLine.remove();
  }
}
