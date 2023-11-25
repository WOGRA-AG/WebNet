import {Component} from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";
import {Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {MatDialog} from "@angular/material/dialog";
import {InputDialogComponent} from "../../shared/components/input-dialog/input-dialog.component";
import {v4 as uuidv4} from 'uuid';
import {KeyValue} from "@angular/common";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";

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

  constructor(private serializationService: SerializationService, protected projectService: ProjectService, private router: Router, private dialog: MatDialog) {
    this.projectService.projectSubject.subscribe((project: any) => {
      this.projects = this.projectService.getMyProjects();
    })

  }

  lastModifiedOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    const dateA = new Date(a.value.projectInfo.lastModified);
    const dateB = new Date(b.value.projectInfo.lastModified);
    return dateB.getTime() - dateA.getTime();
  }


  addFile(file: File): void {
    this.file = file;
  }

  generateProjectId(): string {
    return uuidv4();
  }

  async createNewProject(): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      autoFocus: false,
      data: {message: 'Create a fresh Project.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        const project = this.projectService.createProject(this.generateProjectId(), projectName);
        this.projectService.addProject(project);
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
        projectData.projectInfo.id = this.generateProjectId();
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

  deleteProject(event: Event, name: string): void {
    event.stopPropagation();
    const project = this.projects.get(name);
    if (this.projectService.deleteProject(name)) {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Project deleted',
          message: `You deleted the Project with the name '${project.projectInfo.name}' and the id '${project.projectInfo.id}' successfully!`,
          warning: false
        }
      });
      this.projects = this.projectService.getMyProjects();
    } else {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Deleting Project Failed',
          message: `Deleting the Project with the name '${project.projectInfo.name}' and the id '${project.projectInfo.id}' failed!`,
          warning: true
        }
      });
    }

  }
}
