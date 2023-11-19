import {Component, ViewChild} from '@angular/core';
import {ProjectService} from "../../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {SerializationService} from "../../../core/services/serialization.service";
import {Dataset, TrainingConfig} from "../../../core/interfaces/project";
import {FormBuilder, Validators} from "@angular/forms";
import * as dfd from "danfojs";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  datasetForm;
  splitValue = 80;
  file: File | undefined;
  trainConfig: TrainingConfig;
  displayedColumns: { name: string, type: string, uniqueValues: number }[] = [];
  columnNames: string[] = [];
  dataSource: MatTableDataSource<any>;
  selectedTable: string = 'original';

  constructor(public projectService: ProjectService,
              private serializationService: SerializationService,
              private fb: FormBuilder) {
    this.trainConfig = this.projectService.trainConfig();
    this.splitValue = 100 - (this.trainConfig.validationSplit * 100);
    this.datasetForm = fb.group({
      input: [this.projectService.dataset().inputColumns, Validators.required],
      target: [this.projectService.dataset().targetColumns, Validators.required],
      trainingRatio: [`${this.splitValue.toFixed(0)} %`],
      validationRatio: [`${(100 - this.splitValue).toFixed(0)} %`],
    });
  this.dataSource = new MatTableDataSource();
  }

  async ngOnInit() {
    await this.initTable();
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

  async initTable(): Promise<void> {
    const df = await this.projectService.dataframe();
    const dataset = this.projectService.dataset();
    if (df && df.shape[0] !== 0) {
      this.displayedColumns = dataset.columns;
      this.columnNames = dataset.columns.map(column => column.name);
      this.datasetForm.get('input')?.setValue(this.projectService.dataset().inputColumns);
      this.selectedTable = 'original';
      await this.updateDataSource(this.selectedTable);
    }
  }

  async updateDataSource(dataType: string): Promise<void> {
    if (dataType === 'original') {
      const dataset = this.projectService.dataset();
      this.dataSource!.data = dataset.data;
    } else if (dataType === 'preprocessed') {
      const df = await this.projectService.dataframe();
      const data: { [key: string]: any }[] = dfd.toJSON(df) as { [key: string]: any }[];
      this.dataSource!.data = data;
    }
  }

  initPaginator() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  addFile(file: File) {
    this.file = file;
  }

  async parseCSV() {
    if (this.file) {
      const name = this.file.name;
      const dataset = await this.serializationService.parseCSV(this.file);
      const df = new dfd.DataFrame(dataset.data);

      const columns: { name: string, type: string, uniqueValues: number }[] = [];
      df.columns.forEach(column => {
        columns.push({name: column, type: df[column].dtype, uniqueValues: df[column].nUnique()});
      })

      this.projectService.dataset.mutate((value: Dataset) => {
        value.fileName = name;
        value.data = dataset.data;
        value.columns = columns;
        value.inputColumns = df.columns;
      });
      await this.initTable();
      this.initPaginator();
    }
  }


  ngAfterViewInit() {
    this.initPaginator();
    this.datasetForm?.get('input')?.valueChanges.subscribe((inputColumns: string[] | null) => {
      this.projectService.dataset.mutate((dataset: Dataset) => {
        if (inputColumns) {
          dataset.inputColumns = inputColumns;
        }
      })
    });
    this.datasetForm?.get('target')?.valueChanges.subscribe((targetColumns: string[] | null) => {
      this.projectService.dataset.mutate((dataset: Dataset) => {
        if (targetColumns) {
          dataset.targetColumns = targetColumns;
        }
      })
    });
  }
}

