import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent {
  projectName: string = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: { message: string },
    public dialogRef: MatDialogRef<InputDialogComponent>
  ) {}

  createProject() {
    // todo: check if name already exists
    this.dialogRef.close(this.projectName);
  }
}
