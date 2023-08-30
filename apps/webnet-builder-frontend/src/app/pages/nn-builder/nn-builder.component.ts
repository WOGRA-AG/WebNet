import {Component} from '@angular/core';
import '@svgdotjs/svg.draggable.js'
import {SVG, List, Rect, Element} from "@svgdotjs/svg.js";
import {Flatten} from "./layer/flatten";
import {Layer} from "./layer/layer";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss']
})
export class NnBuilderComponent {
  svg = SVG();
  elementList: Layer[] = [];
  ngAfterViewInit() {
    this.svg.addTo('#svg-container').size(800, 500);
  }

  createFlattenLayer() {
    const layer = new Flatten();
    this.addDragMoveEvent(layer.svgElement);
    this.svg.add(layer.svgElement);
    this.elementList.push(layer);
  }

  addDragMoveEvent(layer: Element) {
    layer.on('dragmove', (e: any) => {
      e.preventDefault();

      const {handler, box} = e.detail;
      let {x, y} = box;

      const svgWidth = Number(this.svg.width());
      const svgHeight = Number(this.svg.height());

      // Calculate the maximum allowed positions
      const maxX = svgWidth - box.width;
      const maxY = svgHeight - box.height;

      // Constrain the x coordinate
      x = x < 0 ? 0 : x > maxX ? maxX : x;

      // Constrain the y coordinate
      y = y < 0 ? 0 : y > maxY ? maxY : y;
      handler.move(x, y);
    })
  }

}
