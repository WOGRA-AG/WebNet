import {computed, Injectable, signal} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MnistTemplate} from "../../shared/template_objects/mnist";
import {Builder, Dataset, Project, ProjectInfo, TrainingConfig} from "../interfaces/project";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private myProjects: Map<string, Project> = new Map();
  private templateProjects: Map<string, Project> = new Map();
  // Signals
  projectSubject: BehaviorSubject<Project|null> = new BehaviorSubject<Project|null>(null);
  projectInfo = signal<ProjectInfo>({name: ''})
  dataset = signal<Dataset>({type: 'text', data: 'data'});
  builder = signal<Builder>({layers: [], connections: []});
  model = signal({});
  trainConfig = signal<TrainingConfig>({
    optimizer: 'adam',
    learningRate: 0.01,
    loss: 'meanSquaredError',
    accuracyPlot: true,
    lossPlot: false
  });

  activeProject = computed(() => {
    return {
      projectInfo: this.projectInfo(),
      dataset: this.dataset(),
      builder: this.builder(),
      model: this.model(),
      trainConfig: this.trainConfig()
    }
  });

  constructor() {
    const mnist = new MnistTemplate();
    const data = mnist.getProject();
    this.templateProjects.set('mnist', data);
  }

  selectProject(name: string): void {
    const project = this.getProjectByName(name);
    this.projectInfo.set(project.projectInfo);
    this.dataset.set(project.dataset);
    this.builder.set(project.builder);
    this.model.set(project.model);
    this.trainConfig.set(project.trainConfig);
  }

  getNumberOfProjects(): number {
    return this.myProjects.size;
  }

  getMyProjects(): Map<string, any> {
    return this.myProjects;
  }

  addProject(project: Project): void {
    this.myProjects.set(project.projectInfo.name, project);
    this.projectSubject.next(project);
  }

  clearMyProjects(): void {
    this.myProjects.clear();
  }

  checkProjectNameTaken(name: string): boolean {
    return this.myProjects.has(name);
  }

  getTemplateProjectByName(name: string): any {
    const templateProject = this.templateProjects.get(name);
    return templateProject ? templateProject : null;
  }

  getProjectByName(name: string): any {
    const myProject = this.myProjects.get(name);
    return myProject ? myProject : null;
  }

  updateProject(name: string): void {
    this.myProjects.set(name, this.activeProject());
  }
}
