import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MnistTemplate} from "../../shared/template_objects/mnist";
import {ModelBuilderService} from "./model-builder.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private myProjects: Map<string, any> = new Map();
  private templateProjects: Map<string, any> = new Map();
  projectSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(private modelBuilderService: ModelBuilderService) {
    const mnist = new MnistTemplate();
    const data = {dataset: mnist.getDataset(), builder: mnist.getBuilder(), model: mnist.getModel()}
    this.templateProjects.set('mnist', data);
  }

  initialize() {
    this.modelBuilderService.isInitialized = false;
  }

  getNumberOfProjects(): number {
    return this.myProjects.size;
  }
  getMyProjects(): Map<string, any> {
    return this.myProjects;
  }

  addProject(project: any): void {
    this.myProjects.set(project.project.name, project);
    this.projectSubject.next(project);
  }

  clearMyProjects(): void {
    this.myProjects.clear();
  }

  getTemplateProjectByName(name: string): any {
    const templateProject = this.templateProjects.get(name);
    if (templateProject) {
      return templateProject;
    }
    return null;
  }
  getProjectByName(name: string): any {
    const myProject = this.myProjects.get(name);
    if (myProject) {
      return myProject;
    }
    return null;
  }
}
