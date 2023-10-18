import {Component} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
})
export class ProjectComponent {
  projectName: string;
  project: any;
  builder: any;
  dataset: any;
  training: any;

  constructor(private projectService: ProjectService, public activatedRoute: ActivatedRoute, private router: Router) {
    this.projectName = activatedRoute.snapshot.params['websiteName'];
    const project = this.projectService.getProjectByName(this.projectName);
    if (!project) {
      this.router.navigate(['/'])
    } else {
      this.projectService.initialize();
      this.project = project.project;
      this.builder = project.builder;
      this.training = project.training;
      this.dataset = project.dataset;
    }
  }

  ngOnDestroy(): void {
    this.projectService.updateProject(this.projectName, {
      project: this.project,
      builder: this.builder,
      dataset: this.dataset,
      training: this.training
    });
  }
}
