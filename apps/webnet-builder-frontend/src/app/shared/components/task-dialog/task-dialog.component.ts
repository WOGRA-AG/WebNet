import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) protected data: { tasks: {task: string, message: string, done: boolean}[] }) {
  }

}
