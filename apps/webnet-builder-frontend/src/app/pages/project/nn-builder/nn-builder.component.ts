import {Component, EventEmitter, HostListener, Input, Output, ViewEncapsulation} from '@angular/core';
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {LayerType} from "../../../core/enums";
import {ProjectService} from "../../../core/services/project.service";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss'],
  encapsulation: ViewEncapsulation.None, // Disable encapsulation
})
export class NnBuilderComponent {
  protected readonly LayerType = LayerType;
  autoSaveInterval: any;
  layerForm: any;
  configuration: any;
  selectedTab = new FormControl(0);
  constructor(private modelBuilderService: ModelBuilderService, private projectService: ProjectService) {
    this.modelBuilderService.selectedLayerSubject.subscribe((layer) => {
      this.layerForm = layer ? layer.layerForm : null;
      this.configuration = layer ? layer.getConfiguration() : null;
      layer ? this.selectedTab.setValue(1) : this.selectedTab.setValue(0);
    })
  }

  async ngOnInit(): Promise<void> {
    await this.modelBuilderService.initialize(this.projectService.builder());
    this.startAutoSave();
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(async () => {
      await this.updateBuilder();
    }, 5000);
  }

  async ngOnDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    await this.updateBuilder();
  }

  async updateBuilder(): Promise<void> {
    this.projectService.builder.set(await this.modelBuilderService.generateBuilderJSON());
  }

  @HostListener('window:keydown.Escape', ['$event'])
  unselectLayer(event: KeyboardEvent): void {
    this.modelBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event'])
  deleteLayer(event: KeyboardEvent): void {
    this.modelBuilderService.deleteSelectedLayer(event);
  }

  async clear(): Promise<void> {
    await this.modelBuilderService.clearModelBuilder();
  }
  createLayer(type: LayerType): void {
    this.modelBuilderService.createLayer({layerType: type});
  }
}
