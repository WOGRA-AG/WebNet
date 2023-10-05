import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Output() fileEvent = new EventEmitter<File>();
  fileName: string = '';

  constructor() {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileEvent.emit(file);
      this.fileName = file.name;
    }
  }
}
