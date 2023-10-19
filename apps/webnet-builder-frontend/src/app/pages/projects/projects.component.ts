import {Component, computed, effect, WritableSignal} from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";
import {Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {MatDialog} from "@angular/material/dialog";
import {InputDialogComponent} from "../../shared/components/input-dialog/input-dialog.component";
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";
import {LayerType} from "../../core/enums";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  file: File | undefined;
  projects: Map<string, any> = new Map();
  templateProjects: string[] = ['mnist'];
  selectedTemplateProject: string | undefined;

  constructor(private serializationService: SerializationService, protected projectService: ProjectService, private router: Router, private dialog: MatDialog) {}


  openDialog() {
    this.dialog.open(InputDialogComponent, {
      data: {}
    });
  }

  addFile(file: File): void {
    this.file = file;
  }

  async createNewProject(): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {message: 'Create a fresh Project.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        this.projectService.addProject(
          {
            projectInfo: {name: projectName},
            dataset: {type: 'text', data: 'data'},
            trainConfig: {optimizer: 'adam', learningRate: 0.01, loss: 'meanSquaredError', accuracyPlot: true, lossPlot: false},
            builder: {layers: [{type: LayerType.Input}, {type: LayerType.Output}], connections: []}
          });
        await this.router.navigate([`/projects/${projectName}`])
      }
    });
  }

  async createProjectFromTemplate(template: string): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {message: 'Create a Project from Template.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        const projectData = this.projectService.getTemplateProjectByName(template);
        projectData.projectInfo.name = projectName;
        this.projectService.addProject(projectData);
        await this.router.navigate([`/projects/${projectName}`])
      }
    });
  }

  async importProject(): Promise<void> {
    if (this.file) {
      const project = await this.serializationService.importZip(this.file);
      this.projectService.addProject(project);
      await this.router.navigate([`/projects/${project.projectInfo.name}`]);
    }
  }
}
