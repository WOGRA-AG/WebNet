import {Component} from '@angular/core';
import '@svgdotjs/svg.draggable.js'
import {Flatten} from "./layer/flatten";
import * as d3 from 'd3';
import {Dense} from "./layer/dense";
import {ModelBuilderService} from "../../core/services/model-builder.service";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss']
})
export class NnBuilderComponent {

  constructor(private modelBuilderService: ModelBuilderService) {}
  ngOnInit() {
    d3.select("#svg-container").on("click", (event: any) => this.unselect(event));
  }
  printModelSummary() {
    this.modelBuilderService.printModelSummary();
  }
  createLayer(type: string) {
    switch (type) {
      case 'dense':
        this.modelBuilderService.addToLayerList((new Dense(this.modelBuilderService)));
        break;
      case 'flatten':
        this.modelBuilderService.addToLayerList((new Flatten(this.modelBuilderService)));
        break;
      default:
        this.modelBuilderService.addToLayerList((new Dense(this.modelBuilderService)));
        break;
    }
  }

  unselect(event: any) {
    this.modelBuilderService.selectedLayerSubject.next(null);
    event.stopPropagation();
  }
}
