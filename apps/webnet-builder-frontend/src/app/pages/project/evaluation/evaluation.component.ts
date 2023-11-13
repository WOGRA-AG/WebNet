import {Component, ElementRef, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {Dataset, TrainingRecords} from "../../../core/interfaces/project";
import {MatSelectionList} from "@angular/material/list";
import {MachineLearningService} from "../../../core/services/machine-learning.service";
import {ModelBuilderService} from "../../../core/services/model-builder.service";
import {MatDialog} from "@angular/material/dialog";
import {MessageDialogComponent} from "../../../shared/components/message-dialog/message-dialog.component";
import {MatTableDataSource} from "@angular/material/table";
import {areBuilderEqual} from "../../../shared/utils";

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
  dataset: Dataset;
  randomExample: { [key: string]: any }[];
  dataSource: MatTableDataSource<any> | undefined;
  displayedColumns: string[] | undefined;
  isSelectedRecordAlreadyLoaded: boolean = false;

  constructor(public projectService: ProjectService,
              private ml: MachineLearningService,
              private modelBuilderService: ModelBuilderService,
              private dialog: MatDialog) {
    this.dataset = this.projectService.dataset();
    this.randomExample = [this.dataset.data[0]];
    this.trainingRecords = this.projectService.trainingRecords();
  }

  ngOnInit() {
    this.displayedColumns = this.dataset.columns;
    this.dataSource = new MatTableDataSource<{ [key: string]: any; }>(this.randomExample);

    this.isSelectedRecordAlreadyLoaded = areBuilderEqual(this.selectedRecord?.builder, this.projectService.builder());

    // this.predict();
  }

  async ngAfterViewInit() {
    await this.getSelectedContent();
  }

  async getSelectedContent() {
    const selectedOption = this.trainHistoryList?.selectedOptions.selected[0];
    if (selectedOption) {
      this.selectedRecord = selectedOption.value;
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
        // width: 200
      }
      await this.ml.renderPlot(this.accuracyContainer.nativeElement,values, series, options);
    } else {
      this.accuracyContainer.nativeElement.innerHTML = '';
    }
  }

  predict() {
    const [X, Y] = this.ml.extractFeaturesAndTargets(this.projectService.dataset());
    this.ml.predict(X, Y);
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

  test(element: number, column: string, test: any) {
    console.log(element, column, test);
  }
}
