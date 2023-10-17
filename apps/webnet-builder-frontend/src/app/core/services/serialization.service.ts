import {Injectable} from '@angular/core';
import * as JSZip from 'jszip';
import {saveAs} from 'file-saver';
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";
import {ProjectService} from "./project.service";

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  zip: JSZip = new JSZip();
  constructor(private modelBuilderService: ModelBuilderService, private projectService: ProjectService) {}

  async exportAsZIP(subProjects: any): Promise<void> {
    if (subProjects.dataset.checked) {
      this.zip.file("dataset/dataset.txt", "D A T A S E T");
    }
    if (subProjects.builder.checked) {
      this.saveWebNetBuilder();
    }
    if (subProjects.tf_model.checked) {
      await this.saveTFModel();
    }
    this.zip.file("project.json", JSON.stringify({name: "WebNet Builder Example"}), {binary: false});
    const content = await this.zip.generateAsync({type: "blob"});
    saveAs(content, "webNet-project.zip")
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
    // todo: checks, some files may not exist
    const project: any = JSON.parse(await files['project.json'].async('string'));
    const dataset: any = await files['dataset/dataset.txt'].async('string');
    const model: any = JSON.parse(await files['tf_model/model.json'].async('string'));
    const builder: any = JSON.parse(await files['builder/model.json'].async('string'));
    return {project, dataset, model, builder};
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
