import {Component} from '@angular/core';
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {
  protected readonly optimizers = optimizers;
  protected readonly losses = losses;
  projectName: string;
  project: any;
  builder: any;
  dataset: any;

  constructor(private projectService: ProjectService, public activatedRoute: ActivatedRoute, private router: Router) {
    this.projectName = activatedRoute.snapshot.params['websiteName'];
    const project = this.projectService.getProjectByName(this.projectName);
    if (!project) {
      this.router.navigate(['/'])
    } else {
      this.project = project.project;
      this.builder = project.builder;
      this.dataset = project.dataset;
      this.projectService.initialize();
    }
  }

  ngOnDestroy() {
    this.projectService.updateProject(this.projectName, {project: this.project, builder: this.builder, dataset: this.dataset});
  }
}
