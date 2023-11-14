import {Injectable} from '@angular/core';
import * as JSZip from 'jszip';
import {Papa} from 'ngx-papaparse';
import {saveAs} from 'file-saver';
import * as tf from "@tensorflow/tfjs";
import {ProjectService} from "./project.service";
import {Project} from "../interfaces/project";
import {MessageDialogComponent} from "../../shared/components/message-dialog/message-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class SerializationService {
  zip: JSZip = new JSZip();

  constructor(private projectService: ProjectService,
              private papa: Papa,
              private dialog: MatDialog) {
  }

  async parseCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      this.papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transform: (value, columnOrHeader) => {
          // todo: need better solution. fast workaround so i dont get null values after dynamic typing.
          return value === '' ? ' ' : value;
        },
        complete: (result: any) => {
          resolve(result);
        },
        error: (error: any) => {
          reject(error);
          console.log(error);
        }
      });
    });
  }

  async exportProjectAsZIP(sections: any): Promise<void> {
    const project = this.projectService.activeProject();
    const projectInfo = project.projectInfo;
    if (sections.dataset.checked) {
      const dataset = JSON.stringify(project.dataset);
      this.zip.file("dataset/dataset.json", dataset, {binary: false});
    }
    if (sections.builder.checked) {
      const builder = project.builder;
      this.zip.file("builder/model.json", JSON.stringify(builder), {binary: false})
    }
    if (sections.trainConfig.checked) {
      const trainConfig = JSON.stringify(project.trainConfig);
      this.zip.file("training/configuration.json", trainConfig, {binary: false});
    }
    if (sections.evaluation.checked) {
      const evaluations = JSON.stringify(project.trainRecords);
      this.zip.file("evaluations/records.json", evaluations, {binary: false});
    }
    // if (sections.tf_model.checked) {
    //   await this.saveTFModel();
    // }
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
    const recordsFile = files['evaluations/records.json'];

    const project = projectFile ? JSON.parse(await projectFile.async('string')) : {};
    const dataset = datasetFile ? JSON.parse(await datasetFile.async('string')) : {};
    const trainConfig = trainingFile ? JSON.parse(await trainingFile.async('string')) : {};
    const builder = builderFile ? JSON.parse(await builderFile.async('string')) : {};
    const records = recordsFile ? JSON.parse(await recordsFile.async('string')) : [];

    return {projectInfo: project, dataset: dataset, trainConfig: trainConfig, builder: builder, trainRecords: records};
  }

  async saveTFModel(): Promise<void> {
    const model: tf.LayersModel | null = this.projectService.model();

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

  async exportModel() {
    const model = this.projectService.model();
    if (model) {
      await model.save('downloads://model');
    } else {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Model Compilation Failed',
          message: 'The model you created in the Modeling Section could not be compiled into a TensorFlow model format. Please ensure that your model is correctly defined.',
          warning: true
        }
      });
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
