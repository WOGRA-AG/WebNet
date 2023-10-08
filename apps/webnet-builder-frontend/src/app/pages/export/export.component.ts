import { Component } from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";

interface SubProject {
  name: string;
  checked: boolean;
}

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  subProjects: Record<string, SubProject> = {
    dataset: {name: 'Dataset', checked: true},
    model: {name: 'Model', checked: true},
    weights: {name: 'Trained Weights', checked: true}
  }
  allChecked: boolean = true;

  constructor(private serializationService: SerializationService) {
  }
  updateAllChecked(): void {
    const subProjectValues = Object.values(this.subProjects);
    this.allChecked = subProjectValues.every((subProject: SubProject) => subProject.checked);
  }

  someChecked(): boolean {
    const subProjectValues = Object.values(this.subProjects);
    return subProjectValues.filter((t: any) => t.checked).length > 0 && !this.allChecked;
  }

  setAll(checked: boolean): void {
    this.allChecked = checked;
    const subProjectValues = Object.values(this.subProjects);
    subProjectValues.forEach((t: any) => (t.checked = checked));
  }

  export(): void {
    this.serializationService.exportAsZIP(this.subProjects);
  }

  async saveModel(): Promise<void> {
    await this.serializationService.saveModel();
  }

  async showAllModels(): Promise<void> {
    await this.serializationService.showAllModels();
  }
}
