import {Component} from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";

interface ProjectSections {
  name: string;
  checked: boolean;
  disabled: boolean
}

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  sections: Record<string, ProjectSections> = {
    dataset: {name: 'Dataset', checked: true, disabled: true},
    builder: {name: 'WebNet Builder', checked: true, disabled: true},
    trainConfig: {name: 'Training Configuration', checked: true, disabled: true},
    tf_model: {name: 'Tensorflow Model', checked: false, disabled: false},
    // weights: {name: 'Trained Weights', checked: true}
  }
  allChecked: boolean = true;

  constructor(private serializationService: SerializationService) {
  }

  updateAllChecked(): void {
    const sectionValues = Object.values(this.sections);
    this.allChecked = sectionValues.every((section: ProjectSections) => section.checked);
  }

  someChecked(): boolean {
    const sectionValues = Object.values(this.sections);
    return sectionValues.filter((section: any) => section.checked).length > 0 && !this.allChecked;
  }

  setAll(checked: boolean): void {
    this.allChecked = checked;
    const sectionValues = Object.values(this.sections);
    sectionValues.forEach((section: any) => {
      if (!section.disabled) {
        section.checked = checked
      }
    });
  }

  export(): void {
    this.serializationService.exportAsZIP(this.sections);
  }

  async saveModel(): Promise<void> {
    await this.serializationService.saveModel();
  }

  async showAllModels(): Promise<void> {
    await this.serializationService.showAllModels();
  }
}
