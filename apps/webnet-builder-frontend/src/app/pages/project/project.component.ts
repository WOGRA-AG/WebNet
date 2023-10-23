import {Component, computed, effect} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {string} from "@tensorflow/tfjs";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent {
  projectName: string;
  datasetError = computed(() => {
    return this.projectService.dataset().data.length < 0 ? true: false;
  })
  constructor(private modelBuilderService: ModelBuilderService, private projectService: ProjectService, public activatedRoute: ActivatedRoute, private router: Router) {
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
    this.projectService.updateProject(this.projectName);
  }

  protected readonly string = string;
}
