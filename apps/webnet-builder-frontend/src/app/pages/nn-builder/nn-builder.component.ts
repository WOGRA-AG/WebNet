import {Component} from '@angular/core';
import '@svgdotjs/svg.draggable.js'
import {SVG, List, Rect, Element} from "@svgdotjs/svg.js";
import {Flatten} from "./layer/flatten";
import {Layer} from "./layer/layer";
import * as d3 from 'd3';
import {Dense} from "./layer/dense";
import * as tf from "@tensorflow/tfjs";
import {input} from "@tensorflow/tfjs";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss']
})
export class NnBuilderComponent {
  svg = SVG();
  elementList: Layer[] = [];
  ngAfterViewInit() {
    // this.svg.addTo('#svg-container').size(800, 500);

    const testElements = d3.selectAll<SVGElement, any>('.test') as d3.Selection<SVGElement, any, any, any>;
  }


  async printModelSummary() {
    await tf.ready();
    const input = tf.input({shape: [32]});
    const hidden = this.elementList[0].getLayer()(this.elementList[0].getParameters()).apply(input);
    // for (let i = 1; i < this.elementList.length; i++) {
    //   this.elementList[i].getLayer()(this.elementList[i].getParameters()).apply(this.element)
    // }
    const model = tf.model({inputs: input, outputs: hidden});
    console.log(model.summary());
  }

  createLayer(type: string) {
    switch (type) {
      case 'dense':
        this.elementList.push(new Dense());
        break;
      case 'flatten':
        this.elementList.push(new Flatten());
        break;
      default:
        this.elementList.push(new Dense());
        break;
    }
  }

  // addDragMoveEvent(layer: Element) {
  //   layer.on('dragmove', (e: any) => {
  //     e.preventDefault();
  //
  //     const {handler, box} = e.detail;
  //     let {x, y} = box;
  //
  //     const svgWidth = Number(this.svg.width());
  //     const svgHeight = Number(this.svg.height());
  //
  //     // Calculate the maximum allowed positions
  //     const maxX = svgWidth - box.width;
  //     const maxY = svgHeight - box.height;
  //
  //     // Constrain the x coordinate
  //     x = x < 0 ? 0 : x > maxX ? maxX : x;
  //
  //     // Constrain the y coordinate
  //     y = y < 0 ? 0 : y > maxY ? maxY : y;
  //     handler.move(x, y);
  //   })
  // }

}
