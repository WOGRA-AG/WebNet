import {Injectable} from '@angular/core';
import * as JSZip from 'jszip';
import {saveAs} from 'file-saver';
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {TrainingService} from "./training.service";

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  zip: JSZip = new JSZip();
  constructor(private modelBuilderService: ModelBuilderService, private trainingService: TrainingService) {}

  async exportAsZIP(subProjects: any): Promise<void> {
    if (subProjects.dataset.checked) {
      this.zip.file("dataset/dataset.txt", "D A T A S E T");
    }
    if (subProjects.builder.checked) {
      this.saveWebNetBuilder();
    }
    if (subProjects.training.checked) {
    // todo: training parameter
      this.saveTrainingConfiguration();
    }
    if (subProjects.tf_model.checked) {
      await this.saveTFModel();
    }
    this.zip.file("project.json", JSON.stringify({name: "WebNet Builder Example"}), {binary: false});
    const content = await this.zip.generateAsync({type: "blob"});
    saveAs(content, "webNet-project.zip")
  }

  saveTrainingConfiguration(): void {
    const configuration: string = JSON.stringify(this.trainingService.getConfiguration());
    this.zip.file("training/configuration.json", configuration, {binary: false});
  }

  saveWebNetBuilder(): void {
    const builder: string = JSON.stringify(this.modelBuilderService.generateBuilderJSON());
    this.zip.file("builder/model.json", builder, {binary: false})
  }

  async saveTFModel(): Promise<void> {
    const model: tf.LayersModel | null = await this.modelBuilderService.generateModel();

    await model?.save(tf.io.withSaveHandler(async (modelArtifacts: tf.io.ModelArtifacts): Promise<any> => {
      const modelData: tf.io.ModelJSON = {
        modelTopology: modelArtifacts.modelTopology?? {},
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
  async importZip(file: any): Promise<any> {
    const zip = await this.zip.loadAsync(file);
    const files = zip.files;

    const projectFile = files['project.json'];
    const datasetFile = files['dataset/dataset.txt'];
    const modelFile = files['tf_model/model.json'];
    const trainingFile = files['training/configuration.json'];
    const builderFile = files['builder/model.json'];

    const project = projectFile ? JSON.parse(await projectFile.async('string')) : {};
    const dataset = datasetFile ? await datasetFile.async('string') : '';
    const model = modelFile ? JSON.parse(await modelFile.async('string')) : {};
    const training = trainingFile ? JSON.parse(await trainingFile.async('string')) : {};
    const builder = builderFile ? JSON.parse(await builderFile.async('string')) : {};

    return { project, dataset, model, training, builder };
  }

  async saveModel() {
    const model = await this.modelBuilderService.generateModel();
    // const saveResults = await model.save('localstorage://my-model-1');
    if (model) {
      const saveResults = await model.save('downloads://my-model-2');
      console.log(saveResults);
      console.log("==SAVED==");
    }
  }

  async listModels() {
    // prints all models saved in local storage and indexedDB
    console.log(JSON.stringify(await tf.io.listModels()));
  }

  async loadModel(file: File) {
    await tf.ready();
    const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([file]));
    console.log(loadedModel);
  }

  async showAllModels() {
    // prints all models saved in local storage and indexedDB
    console.log(JSON.stringify(await tf.io.listModels()));
  }
}
