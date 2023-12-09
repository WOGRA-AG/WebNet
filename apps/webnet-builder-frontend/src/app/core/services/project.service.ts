import {computed, effect, Injectable, signal, untracked} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MnistTemplate} from "../../shared/template_objects/mnist";
import {
  Builder,
  Dataset, EncoderType,
  MetricHistory,
  Project,
  ProjectInfo,
  TrainingConfig,
  TrainingRecords
} from "../interfaces/project";
import {LocalstorageService} from "./localstorage.service";
import {EncoderEnum, LayerType, StorageOption} from "../enums";
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {TrainStats} from "../interfaces/interfaces";
import * as dfd from "danfojs";
import {DataFrame, LabelEncoder, MinMaxScaler, OneHotEncoder, Series, StandardScaler} from "danfojs";


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
    epochs: 10,
    batchSize: 32,
    optimizer: 'sgd',
    learningRate: 0.1,
    loss: 'meanSquaredError',
    accuracyPlot: false,
    lossPlot: false,
    shuffle: true,
    earlyStopping: false,
    saveTraining: true,
    useExistingWeights: false,
    validationSplit: 0.2,
    tfBackend: 'webgpu'
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
    // effect(() => {
    //   console.log('CHANGES DONE TO DATASET: ', this.dataset());
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
      project.dataset.columns.map(async (column: any) => {
        if (column.encoding !== EncoderEnum.no) {
          column.encoder = await this.createEncoderInstance(column.encoding);
        }
      })
      this.dataset.set(project.dataset);
      this.builder.set(project.builder);
      this.trainConfig.set(project.trainConfig);
      this.trainingRecords.set(project.trainRecords);
    }
  }

  async createEncoderInstance(encoding: EncoderEnum): Promise<EncoderType> {
    await tf.ready();
    switch (encoding) {
      case EncoderEnum.onehot:
        return new dfd.OneHotEncoder();
      case EncoderEnum.minmax:
        return new dfd.MinMaxScaler();
      case EncoderEnum.label:
        return new dfd.LabelEncoder();
      case EncoderEnum.standard:
        return new dfd.StandardScaler();
      default:
        return null;
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
        epochs: 10,
        batchSize: 32,
        optimizer: 'sgd',
        learningRate: 0.1,
        loss: 'meanSquaredError',
        accuracyPlot: false,
        lossPlot: false,
        shuffle: true,
        earlyStopping: false,
        saveTraining: true,
        useExistingWeights: false,
        validationSplit: 0.2,
        tfBackend: 'webgpu'
      },
      builder: {layers: [{type: LayerType.Input}, {type: LayerType.Output}], connections: [], nextLayerId: 1},
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


  minMaxEncode(scaler: MinMaxScaler, columnName: string, series: Series, fitting: boolean): DataFrame {
    series.asType('float32', {inplace: true});
    const encodedValues = fitting ? scaler.fitTransform(series).values : scaler.transform(series).values;
    return new dfd.DataFrame({[columnName]: encodedValues});
  }

  standardScaler(scaler: StandardScaler, columnName: string, series: Series, fitting: boolean): DataFrame {
    const encodedValues = fitting ? scaler.fitTransform(series).values : scaler.transform(series).values;
    return new dfd.DataFrame({[columnName]: encodedValues});
  }

  labelEncode(encoder: LabelEncoder, columnName: string, series: Series, fitting: boolean): DataFrame {
    const encodedValues = fitting ? encoder.fitTransform(series).values : encoder.transform(series).values;
    return new dfd.DataFrame({[columnName]: encodedValues});
  }

  oneHotEncode(encoder: OneHotEncoder, columnName: string, series: Series, fitting: boolean): DataFrame {
    if (fitting) {
      const encodedValues = encoder.fitTransform(series.values);
      const labels = series.unique().values;
      const newColumns = labels.map(label => columnName + '_' + label);
      const df = new dfd.DataFrame(encodedValues, {columns: newColumns});
      return df;
    } else {
      const encodedValues = encoder.transform(series.values);
      const columns = [];
      for (let i = 0; i < encodedValues[0].length; i++) {
        columns.push(columnName + '_' + i);
      }
      const df = new dfd.DataFrame(encodedValues, {columns: columns});
      return df;
    }
  }


  replaceEmptyValues(series: Series): Series {
    const med = series.median();
    const replaceEmptyValues = (x: any) => {
      return typeof x === 'string' ? med : x;
    };
    return series.apply(replaceEmptyValues);
  }

  preprocessData(df: DataFrame, fitting: boolean = true): DataFrame {
    const encDfList: DataFrame[] = [];
    for (const column of this.dataset().columns) {
      let series = df[column.name];
      if (series) {
        if (column.encoder instanceof MinMaxScaler) {
          series = this.replaceEmptyValues(series);
          encDfList.push(this.minMaxEncode(column.encoder, column.name, series, fitting));
        } else if (column.encoder instanceof StandardScaler) {
          encDfList.push(this.standardScaler(column.encoder, column.name, series, fitting));
        } else if (column.encoder instanceof LabelEncoder) {
          encDfList.push(this.labelEncode(column.encoder, column.name, series, fitting));
        } else if (column.encoder instanceof OneHotEncoder) {
          encDfList.push(this.oneHotEncode(column.encoder, column.name, series, fitting));
        } else {
          encDfList.push(series);
        }
      }
    }
    const prepDf = dfd.concat({dfList: encDfList, axis: 1}) as DataFrame;
    return prepDf;
  }
}
