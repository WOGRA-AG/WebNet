import {Component} from '@angular/core';
import '@svgdotjs/svg.draggable.js'
import {Flatten} from "./layer/flatten";
import * as d3 from 'd3';
import {Dense} from "./layer/dense";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {FormBuilder, Validators} from '@angular/forms';
import {Input} from "./layer/input";
import {Output} from "./layer/output";
import {Convolution} from "./layer/convolution";

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
//     // Create the input section separator line and label
//     d3.select("#svg-container")
//       .append("line")
//       .attr("x1", 300) // X-coordinate for the start of the line
//       .attr("y1", 0) // Y-coordinate for the start of the line
//       .attr("x2", 300) // X-coordinate for the end of the line
//       .attr("y2", 500) // Y-coordinate for the end of the line
//       .attr("stroke", "black");
//
//     d3.select("#svg-container")
//       .append("text")
//       .attr("x", 150) // X-coordinate for the label
//       .attr("y", 20) // Y-coordinate for the label
//       .attr("text-anchor", "middle")
//       .text("Input");
//
// // Create the hidden layer section separator line and label
//     d3.select("#svg-container")
//       .append("line")
//       .attr("x1", 600) // X-coordinate for the start of the line
//       .attr("y1", 0) // Y-coordinate for the start of the line
//       .attr("x2", 600) // X-coordinate for the end of the line
//       .attr("y2", 500) // Y-coordinate for the end of the line
//       .attr("stroke", "black");
//
//     d3.select("#svg-container")
//       .append("text")
//       .attr("x", 450) // X-coordinate for the label
//       .attr("y", 20) // Y-coordinate for the label
//       .attr("text-anchor", "middle")
//       .text("Hidden Layer");
//
// // Create the output section separator line and label
//     d3.select("#svg-container")
//       .append("line")
//       .attr("x1", 900) // X-coordinate for the start of the line
//       .attr("y1", 0) // Y-coordinate for the start of the line
//       .attr("x2", 900) // X-coordinate for the end of the line
//       .attr("y2", 500) // Y-coordinate for the end of the line
//       .attr("stroke", "black");
//
//     d3.select("#svg-container")
//       .append("text")
//       .attr("x", 750) // X-coordinate for the label
//       .attr("y", 20) // Y-coordinate for the label
//       .attr("text-anchor", "middle")
//       .text("Output");

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
    this.modelBuilderService.selectedLayerSubject.next(null);
    event.stopPropagation();
  }
}
