import {Injectable} from '@angular/core';
import * as JSZip from 'jszip';
import { Papa } from 'ngx-papaparse';
import {saveAs} from 'file-saver';
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {ProjectService} from "./project.service";
import {Project} from "../interfaces/project";

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  zip: JSZip = new JSZip();

  constructor(private modelBuilderService: ModelBuilderService,
              private projectService: ProjectService,
              private papa: Papa) {}

  async parseCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.papa.parse(file, {
        header: true, // Assumes the first row contains column headers
        dynamicTyping: true, // Automatically convert data types
        complete: (result: any) => {
          resolve(result.data);
        },
        error: (error: any) => {
          reject(error);
          console.log(error);
        }
      });
    });
  }

  async exportProjectAsZIP(subProjects: any): Promise<void> {
    const project = this.projectService.activeProject();
    const projectInfo = project.projectInfo;
    if (subProjects.dataset.checked) {
      const dataset = JSON.stringify(project.dataset);
      this.zip.file("dataset/dataset.json", dataset, {binary: false});
    }
    if (subProjects.builder.checked) {
      const builder = project.builder;
      const model = this.projectService.model();

      builder.layers.forEach(layerObject => {
        const layer = model?.getLayer(layerObject.id as string);
        const layerWeights = layer?.getWeights();

        if (layerWeights) {
          const [weights, bias] =
            layerWeights.map(weight => {
              return {values: Object.values(weight.dataSync()), shape: weight.shape}
            });
          layerObject.parameters.weights = {weights: weights, bias: bias};
        }
      })
      this.zip.file("builder/model.json", JSON.stringify(builder), {binary: false})
    }
    if (subProjects.trainConfig.checked) {
      const trainConfig = JSON.stringify(project.trainConfig);
      this.zip.file("training/configuration.json", trainConfig, {binary: false});
    }
    if (subProjects.tf_model.checked) {
      await this.saveTFModel();
    }
    this.zip.file("project.json", JSON.stringify(projectInfo), {binary: false});
    const content = await this.zip.generateAsync({type: "blob"});
    saveAs(content, `${projectInfo.name}.zip`)
  }

  async importZip(file: any): Promise<Project> {
    const zip = await this.zip.loadAsync(file);
    const files = zip.files;

    const projectFile = files['project.json'];
    const datasetFile = files['dataset/dataset.json'];
    const trainingFile = files['training/configuration.json'];
    const builderFile = files['builder/model.json'];

    const project = projectFile ? JSON.parse(await projectFile.async('string')) : {};
    const dataset = datasetFile ? JSON.parse(await datasetFile.async('string')) : {};
    const trainConfig = trainingFile ? JSON.parse(await trainingFile.async('string')) : {};
    const builder = builderFile ? JSON.parse(await builderFile.async('string')) : {};

    return {projectInfo: project, dataset: dataset, trainConfig: trainConfig, builder: builder};
  }

  async saveTFModel(): Promise<void> {
    const model: tf.LayersModel | null = await this.modelBuilderService.generateModel();

    await model?.save(tf.io.withSaveHandler(async (modelArtifacts: tf.io.ModelArtifacts): Promise<any> => {
      const modelData: tf.io.ModelJSON = {
        modelTopology: modelArtifacts.modelTopology ?? {},
        format: modelArtifacts.format,
        generatedBy: modelArtifacts.generatedBy,
        convertedBy: modelArtifacts.convertedBy,
        weightsManifest: [{
          paths: ["./weights.bin"],
          weights: modelArtifacts.weightSpecs as tf.io.WeightsManifestEntry[]
        }],
      };
      this.zip.file("tf_model/model.json", JSON.stringify(modelData), {binary: false});
      this.zip.file('tf_model/weights.bin', JSON.stringify(modelArtifacts.weightData), {binary: true});
    }));
  }

  async saveModel() {
    const model = await this.modelBuilderService.generateModel();
    if (model) {
      const saveResults = await model.save('downloads://model');
    }
  }

  // async listModels() {
  //   // prints all models saved in local storage and indexedDB
  //   console.log(JSON.stringify(await tf.io.listModels()));
  // }
  //
  // async loadModel(file: File) {
  //   await tf.ready();
  //   const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([file]));
  //   console.log(loadedModel);
  // }
  //
  // async showAllModels() {
  //   // prints all models saved in local storage and indexedDB
  //   console.log(JSON.stringify(await tf.io.listModels()));
  // }
}
