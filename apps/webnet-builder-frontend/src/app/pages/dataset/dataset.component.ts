import {Component, ViewChild} from '@angular/core';
import {ProjectService} from "../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {SerializationService} from "../../core/services/serialization.service";
import {Dataset, TrainingConfig} from "../../core/interfaces/project";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  datasetForm;
  splitValue = 80;
  file: File | undefined;
  dataset: Dataset;
  trainConfig: TrainingConfig;
  displayedColumns: string[] | undefined;
  dataSource: MatTableDataSource<any> | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(private projectService: ProjectService,
              private serializationService: SerializationService,
              private fb: FormBuilder) {
    this.dataset = this.projectService.dataset();
    this.trainConfig = this.projectService.trainConfig();
    this.splitValue = 100 - (this.trainConfig.validationSplit * 100);
    this.datasetForm = fb.group({
      input: [this.dataset.inputColumns, Validators.required],
      target: [this.dataset.targetColumns, Validators.required],
      trainingRatio: [`${this.splitValue.toFixed(0)} %`],
      validationRatio: [`${(100 - this.splitValue).toFixed(0)} %`],
    });
  }

  ngOnInit() {
    this.updateDataSource();
    this.initPaginator();
  }

  formatLabel(value: number): string {
    return `${value}%`;
  }

  updateFormValues(percentSplit: number): void {
    this.datasetForm.get('trainingRatio')?.setValue(`${percentSplit.toFixed(0)} %`);
    this.datasetForm.get('validationRatio')?.setValue(`${(100 - percentSplit).toFixed(0)} %`);
  }

  updateSplitValue(percentSplit: number): void {
    this.updateFormValues(percentSplit);
    const splitValue: number = (100 - percentSplit) / 100;
    this.projectService.trainConfig.mutate((trainConfig: TrainingConfig) => {
      trainConfig.validationSplit = splitValue;
    })
  }

  updateDataSource(): void {
    if (this.dataset.data.length > 0) {
      this.dataSource = new MatTableDataSource<{ [key: string]: any; }>(this.dataset.data);
      this.displayedColumns = this.dataset.columns;
      this.datasetForm.get('input')?.setValue(this.dataset.inputColumns);
    }
  }

  initPaginator() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // todo: add explaination, hover tooltip
  // CRIM - per capita crime rate by town
  // ZN - proportion of residential land zoned for lots over 25,000 sq.ft.
  //   INDUS - proportion of non-retail business acres per town.
  //   CHAS - Charles River dummy variable (1 if tract bounds river; 0 otherwise)
  // NOX - nitric oxides concentration (parts per 10 million)
  // RM - average number of rooms per dwelling
  // AGE - proportion of owner-occupied units built prior to 1940
  // DIS - weighted distances to five Boston employment centres
  // RAD - index of accessibility to radial highways
  // TAX - full-value property-tax rate per $10,000
  // PTRATIO - pupil-teacher ratio by town
  // B - 1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town
  // LSTAT - % lower status of the population
  // MEDV - Median value of owner-occupied homes in $1000's

  addFile(file: File) {
    this.file = file;
  }

  async parseCSV() {
    if (this.file) {
      const name = this.file.name;
      const dataset = await this.serializationService.parseCSV(this.file);
      const columns = dataset.meta.fields;
      this.projectService.dataset.mutate((value: Dataset) => {

        value.fileName = name;
        value.data = dataset.data;
        value.columns = columns;
        value.inputColumns = columns;
      });
      this.updateDataSource();
      this.initPaginator();
    }
  }

  ngAfterViewInit() {
    this.initPaginator();
    this.datasetForm?.get('input')?.valueChanges.subscribe((inputColumns: string[]|null) => {
      this.projectService.dataset.mutate((dataset: Dataset) => {
        if (inputColumns) {
          dataset.inputColumns = inputColumns;
        }
      })
    });
    this.datasetForm?.get('target')?.valueChanges.subscribe((targetColumns: string[]|null) => {
      this.projectService.dataset.mutate((dataset: Dataset) => {
        if (targetColumns) {
          dataset.targetColumns = targetColumns;
        }
      })
    });
  }
}

