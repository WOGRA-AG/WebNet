import {Element, SVG} from "@svgdotjs/svg.js";
import {XY} from "../../../core/interfaces";

export class Layer {
  svgElement: Element;
  protected layerName: string;
  protected position: XY;

  protected width: number;
  protected height: number;
  protected color: string;
  protected dragColor: string;
  protected namePos: XY;

  constructor({
                layerName = 'layer',
                position = {x: 50, y: 50},
                dragColor = 'black',
                namePos = {x: 0, y: -15},
                width = 20,
                height = 100,
                color = 'white'
              }) {
    this.layerName = layerName;
    this.position = position;
    this.width = width;
    this.height = height;
    this.color = color;
    this.dragColor = dragColor;
    this.namePos = namePos;
    const svg = SVG();
    const layer = svg.group();
    layer.add(svg.rect(width, height).attr({fill: color}));
    layer.add(svg.circle(width / 2).attr({fill: dragColor}).move(width / 4, height / 2 - width / 2));
    layer.add(svg.plain(layerName).move(- layerName.length, namePos.y));
    layer.move(position.x, position.y);
    layer.draggable().attr({cursor: 'grab'});

    this.svgElement = layer;
  }

  updateConnections() {
    console.log("test");
  }

  getCenter(): XY {
    const x = Number(this.svgElement.x()) + Number(this.svgElement.width()) / 2;
    const y = Number(this.svgElement.y()) + Number(this.svgElement.height()) / 2;
    return {x: x, y: y};
  }

  selectLayer() {
    this.svgElement.forward();
  }

  public getLayerName() {
    return this.layerName;
  }
}
