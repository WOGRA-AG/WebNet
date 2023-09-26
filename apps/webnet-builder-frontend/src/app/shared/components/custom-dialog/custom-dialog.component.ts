import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-custom-dialog',
  templateUrl: './custom-dialog.component.html',
  styleUrls: ['./custom-dialog.component.scss']
})
export class CustomDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) protected data: { tasks: {task: string, message: string, done: boolean}[] }) {
  }

}
