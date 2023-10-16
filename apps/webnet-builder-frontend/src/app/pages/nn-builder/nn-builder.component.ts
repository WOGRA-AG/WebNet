import {Component, HostListener, Input, ViewEncapsulation} from '@angular/core';
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {LayerType} from "../../core/enums";
import {ProjectService} from "../../core/services/project.service";

@Component({
  selector: 'app-nn-builder',
  templateUrl: './nn-builder.component.html',
  styleUrls: ['./nn-builder.component.scss'],
  encapsulation: ViewEncapsulation.None, // Disable encapsulation
})
export class NnBuilderComponent {
  private _builder: any;
  @Input() set builder(value: any) {
    if (value && Object.keys(value).length > 0) {
      this._builder = value;
    } else {
      this._builder = null;
    }
  }
  layerForm: any;
  configuration: any;
  constructor(private modelBuilderService: ModelBuilderService, private projectService: ProjectService) {
    this.modelBuilderService.selectedLayerSubject.subscribe((layer) => {
      this.layerForm = layer ? layer.layerForm : null;
      this.configuration = layer ? layer.getConfiguration() : null;
    })
  }

  ngOnInit(): void {
    // this.modelBuilderService.initialize()
    this._builder ? this.modelBuilderService.initialize(this._builder) : this.modelBuilderService.initialize();
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

  protected readonly LayerType = LayerType;
}
