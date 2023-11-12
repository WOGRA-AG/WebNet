import {Component} from '@angular/core';
import {SerializationService} from "../../../core/services/serialization.service";
import {KeyValue} from "@angular/common";
import {ProjectService} from "../../../core/services/project.service";

interface ProjectSections {
  name: string;
  checked: boolean;
  disabled: boolean;
  order: number;
}

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent {
  sections: Record<string, ProjectSections> = {
    dataset: {name: '1) Dataset', checked: true, disabled: true, order: 1},
    builder: {name: '2) Modeling Builder', checked: true, disabled: true, order: 2},
    trainConfig: {name: '3) Training Configuration', checked: true, disabled: true, order: 3},
    evaluation: {name: '4) Evaluation Data', checked: true, disabled: true, order: 4},
    // tf_model: {name: '5) Tensorflow Model', checked: false, disabled: false, order: 5},
  }
  allChecked: boolean = true;

  constructor(private serializationService: SerializationService, private projectService: ProjectService) {
  }

  fixedOrder = (a: KeyValue<string,any>, b: KeyValue<string,any>): number => {
    return a.value.order - b.value.order;
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

  exportProject(): void {
    this.serializationService.exportProjectAsZIP(this.sections);
  }

  saveInLocalStorage(): void {
    this.projectService.updateProject();
  }

  async exportModel(): Promise<void> {
    await this.serializationService.exportModel();
  }

}
