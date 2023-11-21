import {Component, computed} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {ModelBuilderService} from "../../core/services/model-builder.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent {
  projectName: string;
  datasetError = computed(() => {
    const dataset = this.projectService.dataset();
    if (dataset.data.length <= 0) {
      return 'Please import a dataset to proceed.';
    } else if (dataset.inputColumns.length <= 0) {
      return 'Please specify at least one input column for the machine learning model.';
    } else if (dataset.targetColumns.length <= 0) {
      return 'Please specify at least one target column for the machine learning model.';
    }
    return null;
  })
  modelError = computed(() => {
    return this.projectService.model() === null ? true : false;
  })

  constructor(private modelBuilderService: ModelBuilderService,
              private projectService: ProjectService,
              public activatedRoute: ActivatedRoute,
              private router: Router) {
    this.projectName = activatedRoute.snapshot.params['websiteName'];
    this.projectService.selectProject(this.projectName);
    const project = this.projectService.getProjectByName(this.projectName);
    if (!project) {
      this.router.navigate(['/'])
    } else {
      this.modelBuilderService.isInitialized = false;
    }
  }

  ngOnDestroy(): void {
    this.projectService.updateProject();
  }
}
