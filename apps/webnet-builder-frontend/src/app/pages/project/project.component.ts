import {Component, ElementRef, ViewChild} from '@angular/core';
import * as tfvis from "@tensorflow/tfjs-vis";
import {ModelBuilderService} from "../../core/services/model-builder.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {
  @ViewChild('modelSummaryContainer', {static: false}) modelSummaryContainer!: ElementRef;
  constructor(private modelBuilderService: ModelBuilderService) {
  }
  async showModelSummary(): Promise<void> {
    const model = await this.modelBuilderService.getModel();
    if (model) {
      // tfvis.show.layer(this.modelSummaryContainer.nativeElement, model.getLayer(1));
      // console.log(model.summary());
      await tfvis.show.modelSummary(this.modelSummaryContainer.nativeElement, model);
    }
  }

  async saveModel(): Promise<void> {
    await this.modelBuilderService.saveModel();
  }

  async showAllModels(): Promise<void> {
    await this.modelBuilderService.showAllModels();
  }

  async loadModel(): Promise<void> {
    await this.modelBuilderService.loadModel();
  }

}
