import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProjectService} from "../../core/services/project.service";
import {DatasetService} from "../../core/services/dataset.service";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  dataset: string | undefined

  constructor(private datasetService: DatasetService, private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.dataset = this.projectService.dataset().data;
  }
}
