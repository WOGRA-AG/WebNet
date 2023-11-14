import {Component, HostListener, ViewEncapsulation} from '@angular/core';
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {LayerType} from "../../../core/enums";
import {ProjectService} from "../../../core/services/project.service";
import {FormControl} from "@angular/forms";
import {areBuilderEqual} from "../../../shared/utils";


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
    this.projectService.builder.update((value) => {
      return value
    }) //triggers effect to update model
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.updateBuilder();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.updateBuilder();
  }



  updateBuilder(): void {
    const newBuilder = this.modelBuilderService.generateBuilderJSON();
    const oldBuilder = this.projectService.builder();
    if (!areBuilderEqual(newBuilder, oldBuilder)) {
      this.projectService.initNewWeights.set(true);
      this.projectService.builder.set(newBuilder);
    }
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

  async createLayer(type: LayerType): Promise<void> {
    this.modelBuilderService.createLayer({layerType: type});
  }
}
