import {Component} from '@angular/core';
import '@svgdotjs/svg.draggable.js'
import {Flatten} from "./layer/flatten";
import * as d3 from 'd3';
import {Dense} from "./layer/dense";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {FormBuilder, Validators} from '@angular/forms';
import {Input} from "./layer/input";
import {Output} from "./layer/output";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss']
})
export class NnBuilderComponent {

  layerForm = this.fb.group({
    shape: [''],
    units: [500, [Validators.required, Validators.minLength(3), Validators.maxLength(10)]]
  });
  configuration: any;

  constructor(private modelBuilderService: ModelBuilderService, private fb: FormBuilder) {
    this.modelBuilderService.selectedLayerSubject.subscribe((layer) => {
      this.configuration = layer ? layer.getConfiguration() : null;
    })
  }

  ngOnInit() {
    d3.select("#svg-container").on("click", (event: any) => this.unselect(event));
    this.createLayer('input');
    this.createLayer('output');
  }

  printModelSummary() {
    this.modelBuilderService.printModelSummary();
  }

  createLayer(type: string) {
    switch (type) {
      case 'input':
        this.modelBuilderService.addToLayerList((new Input(this.modelBuilderService)));
        break;
      case 'dense':
        this.modelBuilderService.addToLayerList((new Dense(this.modelBuilderService)));
        break;
      case 'flatten':
        this.modelBuilderService.addToLayerList((new Flatten(this.modelBuilderService)));
        break;
      case 'output':
        this.modelBuilderService.addToLayerList((new Output(this.modelBuilderService)));
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
