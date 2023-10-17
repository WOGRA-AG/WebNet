import {Component, EventEmitter, HostListener, Input, Output, ViewEncapsulation} from '@angular/core';
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {LayerType} from "../../core/enums";
import {ProjectService} from "../../core/services/project.service";
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
  private _builder: any;
  @Input() set builder(value: any) {
    if (value && Object.keys(value).length > 0) {
      this._builder = value;
    } else {
      this._builder = null;
    }
  }
  @Output() builderChange = new EventEmitter<any>();
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

  ngOnInit(): void {
    this._builder ? this.modelBuilderService.initialize(this._builder) : this.modelBuilderService.initialize();
    this.startAutoSave();
  }

  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.updateBuilder();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.updateBuilder();
    }
  }

  updateBuilder(): void {
    this.builderChange.next(this.modelBuilderService.generateBuilderJSON());
  }

  @HostListener('window:keydown.Escape', ['$event'])
  unselectLayer(event: KeyboardEvent): void {
    this.modelBuilderService.unselect(event);
  }

  @HostListener('window:keydown.Delete', ['$event'])
  deleteLayer(event: KeyboardEvent): void {
    this.modelBuilderService.deleteSelectedLayer(event);
  }

  clear(): void {
    this.modelBuilderService.clearModelBuilder();
  }
  createLayer(type: LayerType): void {
    this.modelBuilderService.createLayer(type);
  }
}
