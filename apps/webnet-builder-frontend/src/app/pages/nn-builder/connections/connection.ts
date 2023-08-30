import {Element, Point, SVG} from "@svgdotjs/svg.js";
import {XY} from "../../../core/interfaces";
import {Layer} from "../layer/layer";

export class Connection {
  svgElement: Element;
  connectionName: string;
  inputPos: XY;
  outputPos: XY;
  input: Layer;
  output: Layer;


  constructor(input: Layer,
              output: Layer,
              {
                connectionName = 'connection',
                inputPos = {x: 50, y: 50},
                outputPos = {x: 0, y: -15},
                color = 'red'
              }) {
    this.connectionName = connectionName;
    this.input = input;
    this.output = output;
    this.inputPos = inputPos;
    this.outputPos = outputPos;
    const svg = SVG();
    const connection = svg.group();
    connection.add(svg.line(inputPos.x, inputPos.y, outputPos.x, outputPos.y).stroke({
      color: color,
      width: 10,
      linecap: 'round'
    }));

    this.svgElement = connection;
  }
  getCenter(): XY {
    const x = Number(this.svgElement.x()) + Number(this.svgElement.width()) / 2;
    const y = Number(this.svgElement.y()) + Number(this.svgElement.height()) / 2;
    return {x: x, y: y};
  }
}
