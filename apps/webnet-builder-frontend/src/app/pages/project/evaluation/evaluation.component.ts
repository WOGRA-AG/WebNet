import {Component, ElementRef, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {TrainingRecords} from "../../../core/interfaces/project";
import {MatSelectionList} from "@angular/material/list";
import {MachineLearningService} from "../../../core/services/machine-learning.service";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../../shared/components/message-dialog/message-dialog.component";
import {areBuilderEqual} from "../../../shared/utils";
import * as dfd from "danfojs";
import * as tf from "@tensorflow/tfjs";
import {DataFrame} from "danfojs";

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss']
})
export class EvaluationComponent {
  @ViewChild('lossContainer', {static: false}) lossContainer!: ElementRef;
  @ViewChild('accuracyContainer', {static: false}) accuracyContainer!: ElementRef;
  @ViewChild('trainHistoryList') trainHistoryList: MatSelectionList | undefined;
  selectedRecord: TrainingRecords | null = null;
  trainingRecords: TrainingRecords[];
  isSelectedRecordAlreadyLoaded: boolean = false;
  inputColumns: string[] = [];
  sample: DataFrame|null = null;
  tempSample: { [key: string]: any } = {};
  prediction: string = "-";
  target: string = "-";

  constructor(public projectService: ProjectService,
              private ml: MachineLearningService,
              private modelBuilderService: ModelBuilderService,
              private dialog: MatDialog) {
    this.trainingRecords = this.projectService.trainingRecords();
  }

  async ngOnInit() {
    this.isSelectedRecordAlreadyLoaded = areBuilderEqual(this.selectedRecord?.builder, this.projectService.builder());
    this.inputColumns = this.projectService.dataset().inputColumns;
    this.loadRandomDataSample();
  }

  async ngAfterViewInit() {
    await this.getSelectedContent();
  }

  async getSelectedContent() {
    const selectedOption = this.trainHistoryList?.selectedOptions.selected[0];
    if (selectedOption) {
      this.selectedRecord = selectedOption.value;
      // todo: change boolean to id of record, so i can style the "loaded" list option
      this.isSelectedRecordAlreadyLoaded = areBuilderEqual(this.selectedRecord?.builder, this.projectService.builder());
      await this.displayLossPlot();
      await this.displayAccuracyPlot();
    }
  }

  async displayLossPlot() {
    if (this.selectedRecord?.history.loss && this.selectedRecord?.history.val_loss) {
      const values = [this.selectedRecord?.history.loss, this.selectedRecord?.history.val_loss];
      const series = ['Loss', 'Val_Loss'];
      const options = {
        xLabel: "Epoch",
        yLabel: "Loss",
      }
      await this.ml.renderPlot(this.lossContainer.nativeElement,values, series, options)
    } else {
      this.lossContainer.nativeElement.innerHTML = '';
    }
  }

  async displayAccuracyPlot() {
    if (this.selectedRecord?.history.acc && this.selectedRecord?.history.val_acc) {
      const values = [this.selectedRecord?.history.acc, this.selectedRecord?.history.val_acc];
      const series = ['Accuracy', 'Val_Accuracy'];
      const options = {
        xLabel: "Epoch",
        yLabel: "Accuracy",
      }
      await this.ml.renderPlot(this.accuracyContainer.nativeElement,values, series, options);
    } else {
      this.accuracyContainer.nativeElement.innerHTML = '';
    }
  }

  loadTrainingRecord(): void {
    const record = this.selectedRecord;
    if (record && record?.builder, record?.config) {
      this.modelBuilderService.isInitialized = false;
      this.projectService.builder.set(record.builder);
      this.projectService.trainConfig.set(record.config);
      this.isSelectedRecordAlreadyLoaded = true;
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Successfully loaded',
          message: 'Model and its Configuration loaded successfully. You are now able to check out the model in the Modeling-Section or start the Training in the Training-Section.',
          warning: false
        }
      });
    } else {
      this.dialog.open(MessageDialogComponent, {
        maxWidth: '600px',
        data: {
          title: 'Loading Failed',
          message: 'The Record is not loaded. This Record seems to be corrupted.',
          warning: true
        },
      });
    }
  }

  async predict() {
    if (this.sample && this.sample.shape[0] !== 0) {
      await tf.ready();
      await this.projectService.dataframe(); // to trigger computed, before preprocessing!
      const preprocessData = this.projectService.preprocessData(this.sample, false);

      const [X, Y] = await this.ml.extractFeaturesAndTargets(preprocessData);
      const reshapedX = this.ml.reshapeTensors(X);

      if (reshapedX) {
        this.prediction = this.ml.predict(reshapedX);
        this.target = Y.dataSync()[0].toString();
      } else {
        this.dialog.open(MessageDialogComponent, {
          maxWidth: '600px',
          data: {
            title: 'Predicting Failed',
            message: 'Make sure that your model and dataset are loaded correctly.',
            warning: true
          },
        });
      }
    }
  }

  loadRandomDataSample(): void {
    const dataset = this.projectService.dataset();
    const df = new dfd.DataFrame(dataset.data);
    const columns =  [...this.inputColumns, ...this.projectService.dataset().targetColumns];

    this.sample = df.loc({rows: [Math.floor(Math.random() * df.shape[0])],
      columns: columns});
    this.inputColumns.forEach(column => {
      this.tempSample[column] = this.sample![column].values[0]; // Assuming single-row DataFrame
    });
  }

  onInputChange(column: string) {
    if (this.sample) {
      this.sample[column].values[0] = this.tempSample[column];
    }
  }
}
