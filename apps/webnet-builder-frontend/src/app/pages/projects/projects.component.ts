import {Component} from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  file: File | undefined;

  constructor(private serializationService: SerializationService) {
  }

  addFile(file: File): void {
    this.file = file;
  }

  async importProject(): Promise<void> {

    if (this.file) {
      await this.serializationService.importZip(this.file);
      // await this.serializationService.loadModel(this.file);
    }
  }
}
