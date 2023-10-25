import {Component, ViewChild} from '@angular/core';
import {ProjectService} from "../../core/services/project.service";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";

@Component({
  selector: 'app-dataset',
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.scss']
})
export class DatasetComponent {
  dataset: { [key: string]: any; }[] | undefined;
  displayedColumns: string[] | undefined;
  dataSource: MatTableDataSource<any> | undefined;
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(private projectService: ProjectService) {
  }

  ngAfterViewInit() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngOnInit(): void {
    const data = this.projectService.dataset().data;
    this.dataSource = new MatTableDataSource<{ [key: string]: any; }>(data);
    this.dataset = data;
    this.displayedColumns = Object.keys(data[0]);
  }
}

