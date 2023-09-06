import * as d3 from "d3";
import {Layer} from "./layer";

export class Connection {
  private source: Layer;
  private dashedLine: d3.Selection<any, any, any, any>;
  constructor(source: Layer){
    this.source = source;
    const position = this.source.getOutputAnchorPosition();
    this.dashedLine =  d3.select("#inner-svg-container").append<SVGGraphicsElement>("line")
      .attr("x1", position.x)
      .attr("y1", position.y)
      .style("stroke", "black")
      .style("stroke-width", 6)
      .style("stroke-dasharray", ("8, 8"));
  }

  moveToMouse(event: any): void {
    this.dashedLine
      .attr("x2", event.x)
      .attr("y2", event.y);
  }

  updateSourcePosition() {
    const position = this.source.getOutputAnchorPosition();
    this.dashedLine
      .attr("x1", position.x)
      .attr("y1", position.y)
  }
}
