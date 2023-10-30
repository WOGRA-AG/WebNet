import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProjectService} from "../../../core/services/project.service";
import {AbstractControl, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent {
  projectNameControl: FormControl = new FormControl(
    '',
    [
      Validators.required,
      (control: AbstractControl) => {
        const projectName = control.value;
        if (projectName && projectName.trim() === '') {
          return { invalid: true };
        }
        if (projectName && this.projectService.checkProjectNameTaken(projectName)) {
          return { taken: true };
        }
        return null;
      }
    ]
  );

  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: { message: string },
    public dialogRef: MatDialogRef<InputDialogComponent>,
    private projectService: ProjectService
  ) {}

  createProject() {
    if (this.projectNameControl.invalid) {
      return;
    }
    this.dialogRef.close(this.projectNameControl.value);
  }
}
