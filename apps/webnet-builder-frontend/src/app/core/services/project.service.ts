import {computed, effect, Injectable, signal, untracked} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MnistTemplate} from "../../shared/template_objects/mnist";
import {
  Builder,
  Dataset,
  MetricHistory,
  Project,
  ProjectInfo,
  TrainingConfig,
  TrainingRecords
} from "../interfaces/project";
import {LocalstorageService} from "./localstorage.service";
import {LayerType, StorageOption} from "../enums";
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {TrainStats} from "../interfaces/interfaces";
import * as dfd from "danfojs";
import {DataFrame, Series} from "danfojs";


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly myProjects: Map<string, Project> = new Map();
  private templateProjects: Map<string, Project> = new Map();
  // Signals
  projectSubject: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);
  // todo: initial value. getter!
  projectInfo = signal<ProjectInfo>({
    id: '',
    name: '',
    lastModified: new Date(),
    storeLocation: StorageOption.Unknown
  })
  dataset = signal<Dataset>({
    data: [{'text': 'Das ist ein Test und nur ein Test!'}],
    fileName: '',
    columns: [],
    inputColumns: [],
    targetColumns: []
  });

  dataframe = computed(async () => {
    const dataset = this.dataset();
    const df = new dfd.DataFrame(dataset.data);
    if (df && df.shape[0] !== 0) {
      await tf.ready();
      return this.preprocessData(df);
    }
    return df;
  })
  builder = signal<Builder>({
    layers: [],
    connections: [],
    nextLayerId: 0
  });
  initNewWeights = signal<boolean>(false);
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
    saveTraining: true,
    useExistingWeights: false,
    validationSplit: 0.2
  });
  trainingRecords = signal<TrainingRecords[]>([]);
  activeProject = computed(() => {
    return {
      projectInfo: this.projectInfo(),
      dataset: this.dataset(),
      builder: this.builder(),
      model: this.model(),
      trainConfig: this.trainConfig(),
      trainRecords: this.trainingRecords(),
    }
  });

  constructor(private localStorageService: LocalstorageService, private modelBuilderService: ModelBuilderService) {
    const mnist = new MnistTemplate();
    const data = mnist.getProject();
    this.templateProjects.set('mnist', data);
    // effect(() => {
    //   console.log('CHANGES DONE TO PROJECT: ', this.activeProject());
    // })
    // effect(() => {
    //   console.log('CHANGES DONE TO MODEL: ', this.model());
    // })
    // effect(() => {
    //   console.log('CHANGES DONE TO BUILDER: ', this.builder());
    // })
    this.myProjects = this.localStorageService.getProjectsFromLocalStorage();
    effect(async () => {
      this.builder();
      const initWeights = untracked(this.initNewWeights);
      const model = await this.modelBuilderService.generateModel(!initWeights);
      this.model.set(model);
      this.initNewWeights.set(false);
    });
  }

  async selectProject(name: string): Promise<void> {
    this.modelBuilderService.clearLayers();
    const project = this.getProjectByName(name);
    if (project) {
      this.projectInfo.set(project.projectInfo);
      this.dataset.set(project.dataset);
      this.builder.set(project.builder);
      this.trainConfig.set(project.trainConfig);
      this.trainingRecords.set(project.trainRecords);
    }
  }

  addTrainingRecord(trainStats: TrainStats, history: MetricHistory): void {
    this.trainingRecords.mutate(trainings => trainings.splice(0, 0, {
      id: trainings.length + 1,
      date: new Date(),
      config: this.trainConfig(),
      datasetName: this.dataset().fileName,
      builder: this.builder(),
      trainStats: trainStats,
      history: history
    }));
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

  createProject(id: string, name: string): Project {
    return {
      projectInfo: {
        id: id,
        name: name,
        lastModified: new Date(),
        storeLocation: StorageOption.InMemory
      },
      dataset: {data: [], fileName: '', columns: [], inputColumns: [], targetColumns: []},
      trainConfig: {
        epochs: 100,
        batchSize: 32,
        optimizer: 'adam',
        learningRate: 0.01,
        loss: 'meanSquaredError',
        accuracyPlot: true,
        lossPlot: false,
        shuffle: true,
        saveTraining: true,
        useExistingWeights: false,
        validationSplit: 0.2
      },
      builder: {layers: [{type: LayerType.Input}, {type: LayerType.Output}], connections: [], nextLayerId: 3},
      trainRecords: []
    }
  }

  deleteProject(name: string): boolean {
    return this.myProjects.delete(name) && this.localStorageService.deleteProjectFromLocalStorage(name);
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
    const projectName = project.projectInfo.name;
    if (projectName) {
      this.myProjects.set(projectName, project);
      this.storeProjectInLocalStorage(projectName, project);
    }
  }

  storeProjectInLocalStorage(name: string, project: Project): void {
    this.projectInfo.mutate((project) => {
      project.storeLocation = StorageOption.LocalStorage;
      project.lastModified = new Date();
    });
    this.localStorageService.saveProjectInLocalStorage(name, project);
  }

  ordinalEncode(data: string[]) {
    // const vocab = Array.from(new Set(data));
    // const ordinalEncodedData = data.map(value => vocab.indexOf(value));
    // return ordinalEncodedData;
  }

  oneHotEncode(data: number[]) {
    // const vocab = new Set(data);
    // const oneHotEncodedData = tf.oneHot(data, vocab.size);
    // return oneHotEncodedData;
  }


  minMaxEncode(series: Series): Series {
    series.asType('float32', {inplace: true});
    const scaler = new dfd.MinMaxScaler();
    scaler.fit(series);
    return scaler.transform(series);
  }

  labelEncode(series: Series): Series {
    let encode = new dfd.LabelEncoder();
    encode.fit(series);
    return encode.transform(series.values);
  }

  replaceEmptyValues(series: Series): Series {
    const med = series.median();
    const replaceEmptyValues = (x: any) => {
      return typeof x === 'string' ? med : x;
    };
    return series.apply(replaceEmptyValues);
  }

  preprocessData(df: DataFrame): DataFrame {
    const columnValues: { [key: string]: any } = {};

    for (const column of this.dataset().columns) {
      let series = df[column.name];
      // console.log(column.name, column.type);
      if ((column.type === 'int32' || column.type === 'float32') && column.uniqueValues > 2 && column.uniqueValues < df.shape[0]) {
        series = this.replaceEmptyValues(series);
        series = this.minMaxEncode(series);
        columnValues[column.name] = series.values;
        // console.log("MINMAX");
      } else if (column.type === 'string') {
        series = this.labelEncode(series);
        columnValues[column.name] = series;
        // console.log("LABEL ENCODER");
      } else {
        columnValues[column.name] = series.values;
        // console.log("NO ENCODER");
      }
      // console.log("========");
    }
    // console.log(columnValues);
    return new dfd.DataFrame(columnValues);
  }
}
