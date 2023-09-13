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
    this.modelBuilderService.initialize();
  }

  printModelSummary() {
    this.modelBuilderService.printModelSummary();
  }

  createLayer(type: string) {
    switch (type) {
      case 'dense':
        this.modelBuilderService.addToLayerList((new Dense(this.modelBuilderService)));
        break;
      case 'convolution':
        this.modelBuilderService.addToLayerList((new Convolution(this.modelBuilderService)));
        break;
      case 'flatten':
        this.modelBuilderService.addToLayerList((new Flatten(this.modelBuilderService)));
        break;
      default:
        this.modelBuilderService.addToLayerList((new Dense(this.modelBuilderService)));
        break;
    }
  }
}
