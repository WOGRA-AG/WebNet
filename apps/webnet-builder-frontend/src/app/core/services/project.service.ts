import {computed, effect, Injectable, Signal, signal} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MnistTemplate} from "../../shared/template_objects/mnist";
import {Builder, Dataset, Project, ProjectInfo, TrainingConfig} from "../interfaces/project";
import {LocalstorageService} from "./localstorage.service";
import {StorageOption} from "../enums";
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private myProjects: Map<string, Project> = new Map();
  private templateProjects: Map<string, Project> = new Map();
  // Signals
  projectSubject: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);
  projectInfo = signal<ProjectInfo>({
    id: '',
    name: '',
    lastModified: new Date(),
    storeLocation: StorageOption.Unknown
  })
  dataset = signal<Dataset>({
    type: 'text',
    data: [{'text': 'Das ist ein Test und nur ein Test!'}],
    fileName: '',
    columns: [],
    inputColumns: [],
    targetColumns: []
  });
  builder = signal<Builder>({
    layers: [],
    connections: []
  });

  model = signal<tf.LayersModel | null>(null);

  trainConfig = signal<TrainingConfig>({
    epochs: 100,
    batchSize: 32,
    optimizer: 'adam',
    learningRate: 0.01,
    loss: 'meanSquaredError',
    accuracyPlot: true,
    lossPlot: false,
    shuffle: true,
    validationSplit: 0.2
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

  constructor(private localStorageService: LocalstorageService, private modelBuilderService: ModelBuilderService) {
    const mnist = new MnistTemplate();
    const data = mnist.getProject();
    this.templateProjects.set('mnist', data);
    // effect(() => {
    //   console.log('CHANGES DONE TO PROJECT: ', this.activeProject());
    // })
    effect(() => {
      console.log('CHANGES DONE TO MODEL: ', this.model());
    })
    this.myProjects = this.localStorageService.getProjectsFromLocalStorage();
    effect(async () => {
      this.builder();
      const model = await this.modelBuilderService.generateModel();
      this.model.set(model);
    });
  }

  async selectProject(name: string): Promise<void> {
    const project = this.getProjectByName(name);
    this.modelBuilderService.clearLayers();
    this.projectInfo.set(project.projectInfo);
    this.dataset.set(project.dataset);
    this.builder.set(project.builder);
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

  updateProject(): void {
    const project = this.activeProject();
    this.myProjects.set(project.projectInfo.name, project);
    this.storeProjectInLocalStorage(project.projectInfo.name, project);
  }

  storeProjectInLocalStorage(name: string, project: Project): void {
    this.projectInfo.mutate((project) => {
      project.storeLocation = StorageOption.LocalStorage;
      project.lastModified = new Date();
    });
    this.localStorageService.saveProjectInLocalStorage(name, project);
  }
}
