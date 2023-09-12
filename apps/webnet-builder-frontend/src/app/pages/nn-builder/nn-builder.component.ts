import {Component, ViewEncapsulation} from '@angular/core';
import {Flatten} from "../../shared/layer/flatten";
import * as d3 from 'd3';
import {Dense} from "../../shared/layer/dense";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {FormBuilder, Validators} from '@angular/forms';
import {Input} from "../../shared/layer/input";
import {Output} from "../../shared/layer/output";
import {Convolution} from "../../shared/layer/convolution";
import {Selection} from "d3";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss'],
  encapsulation: ViewEncapsulation.None, // Disable encapsulation
})
export class NnBuilderComponent {

  layerForm = this.fb.group({
    shape: [''],
    units: [500, [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    filter: [3],
    kernelSize: [2]
  });
  configuration: any;

  constructor(private modelBuilderService: ModelBuilderService, private fb: FormBuilder) {
    this.modelBuilderService.selectedLayerSubject.subscribe((layer) => {
      this.configuration = layer ? layer.getConfiguration() : null;
    })
  }

  ngOnInit() {
    const svg: Selection<any, any, any, any> = d3.select("#svg-container");
    svg.on("click", (event: any) => this.unselect(event));

    const svgWidth = svg.node().getBoundingClientRect().width;
    const svgHeight = svg.node().getBoundingClientRect().height;
    svg.call(d3.zoom().scaleExtent([0.4, 1.1]).translateExtent([[-svgWidth, -svgHeight], [2 * svgWidth, 2 * svgHeight]]).on('zoom', (event: any) => {
      d3.select("#inner-svg-container").attr('transform', event.transform);
    }));
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
      case 'convolution':
        this.modelBuilderService.addToLayerList((new Convolution(this.modelBuilderService)));
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
    event.stopPropagation();
    this.modelBuilderService.selectedLayerSubject.next(null);
  }
}
