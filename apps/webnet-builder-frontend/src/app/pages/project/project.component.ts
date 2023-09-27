import {Component, ElementRef, ViewChild} from '@angular/core';
import * as tfvis from "@tensorflow/tfjs-vis";
import {ModelBuilderService} from "../../core/services/model-builder.service";
import {TrainingService} from "../../core/services/training.service";
import {TrainStats} from "../../core/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {CustomDialogComponent} from "../../shared/components/custom-dialog/custom-dialog.component";
import {AbstractControl, FormGroup, NonNullableFormBuilder, Validators} from "@angular/forms";
import {optimizers} from "../../shared/tf_objects/optimizers";
import {losses} from "../../shared/tf_objects/losses";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent {

  protected readonly optimizers = optimizers;
  protected readonly losses = losses;





}
