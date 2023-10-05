import {Injectable} from '@angular/core';
import * as JSZip from 'jszip';
import {saveAs} from 'file-saver';
import * as tf from "@tensorflow/tfjs";
import {ModelBuilderService} from "./model-builder.service";

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  zip: JSZip = new JSZip();
  constructor(private modelBuilderService: ModelBuilderService) {
  }

  async exportProject(subProjects: any): Promise<void> {

    if (subProjects.dataset.checked) {
      this.zip.folder('dataset')?.file("dataset.txt", "D A T A S E T");
    }
    if (subProjects.model.checked) {
      const model: tf.LayersModel | null = await this.modelBuilderService.generateModel();

      await model?.save(tf.io.withSaveHandler(async (modelArtifacts: tf.io.ModelArtifacts): Promise<any> => {
        const modelData = {
          modelTopology: modelArtifacts.modelTopology,
          format: modelArtifacts.format,
          generatedBy: modelArtifacts.generatedBy,
          convertedBy: modelArtifacts.convertedBy,
          weightsManifest: [{
            paths: ["./weights.bin"],
            weights: modelArtifacts.weightSpecs
          }],
        };
        this.zip.file("model/model.json", JSON.stringify(modelData), {binary: false});
        this.zip.file('model/weights.bin', JSON.stringify(modelArtifacts.weightData), {binary: true});
      }));
    }
    if (subProjects.weights.checked) {
      //   todo
    }

    this.zip.generateAsync({type: "blob"})
      .then((content: Blob) => {
        saveAs(content, "webNet-project.zip")
      });
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

  async loadModel() {
    await tf.ready();
    // const loadedModel = await tf.loadLayersModel('localstorage://my-model-1');
    const loadedModel = await tf.loadLayersModel(tf.io.browserFiles([]));
    console.log(loadedModel);
    console.log("==LOADED==");
  }

  async showAllModels() {
    // prints all models saved in local storage and indexedDB
    console.log(JSON.stringify(await tf.io.listModels()));
  }
}
