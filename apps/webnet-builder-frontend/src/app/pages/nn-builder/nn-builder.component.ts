import {Component, ElementRef, HostListener, ViewChild, ViewEncapsulation} from '@angular/core';
import {Flatten} from "../../shared/layer/flatten";
import {Dense} from "../../shared/layer/dense";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {FormBuilder, Validators} from '@angular/forms';
import {Convolution} from "../../shared/layer/convolution";
import * as tfvis from "@tensorflow/tfjs-vis";

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
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;

  constructor(private modelBuilderService: ModelBuilderService, private fb: FormBuilder) {
    this.modelBuilderService.selectedLayerSubject.subscribe((layer) => {
      this.configuration = layer ? layer.getConfiguration() : null;
    })
  }

  ngOnInit(): void {
    this.modelBuilderService.initialize();
  }

  @HostListener('window:keydown.Escape', ['$event']) unselectLayer(event: KeyboardEvent): void {
    this.modelBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event']) deleteLayer(event: KeyboardEvent): void {
    this.modelBuilderService.deleteSelectedLayer(event);
  }

  async showModelSummary(): Promise<void> {
    const model = await this.modelBuilderService.getModel();
    if (model) {
      // tfvis.show.layer(this.modelSummaryContainer.nativeElement, model.getLayer(1));
      console.log(model.summary());
      await tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
    }
  }

  createLayer(type: string): void {
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
