import { Component } from '@angular/core';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  project: any = {
    name: 'Everything',
    checked: true,
    subProjects: [
      {name: 'Dataset', checked: true},
      {name: 'Model', checked: true},
      {name: 'Trained Weights', checked: true},
    ],
  };
  allChecked: boolean = true;

  updateAllChecked(): void {
    this.allChecked = this.project.subProjects != null && this.project.subProjects.every((t: any) => t.checked);
  }

  someChecked(): boolean {
    if (this.project.subProjects == null) {
      return false;
    }
    return this.project.subProjects.filter((t: any) => t.checked).length > 0 && !this.allChecked;
  }

  setAll(checked: boolean): void {
    this.allChecked = checked;
    if (this.project.subProjects == null) {
      return;
    }
    this.project.subProjects.forEach((t: any) => (t.checked = checked));
  }

  export(): void {
    console.log('EXPORT');
  }
}
