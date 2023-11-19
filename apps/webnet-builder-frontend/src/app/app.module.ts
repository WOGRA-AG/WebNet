import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './pages/home/home.component';
import { TestingComponent } from './pages/testing/testing.component';
import { TrainingContainerComponent } from './shared/components/training-container/training-container.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NnBuilderComponent } from './pages/project/nn-builder/nn-builder.component';
import { DynamicLayerFormComponent } from './shared/components/dynamic-layer-form/dynamic-layer-form.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectComponent } from './pages/project/project.component';
import { TaskDialogComponent } from './shared/components/task-dialog/task-dialog.component';
import { TrainingComponent } from './pages/project/training/training.component';
import { ExportComponent } from './pages/project/export/export.component';
import { FileUploadComponent } from './shared/components/file-upload/file-upload.component';
import { DatasetComponent } from './pages/project/dataset/dataset.component';
import { InputDialogComponent } from './shared/components/input-dialog/input-dialog.component';
import { MessageDialogComponent } from './shared/components/message-dialog/message-dialog.component';
import { EvaluationComponent } from './pages/project/evaluation/evaluation.component';
import {NgOptimizedImage} from "@angular/common";



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TestingComponent,
    TrainingContainerComponent,
    NnBuilderComponent,
    DynamicLayerFormComponent,
    ProjectsComponent,
    ProjectComponent,
    TaskDialogComponent,
    TrainingComponent,
    ExportComponent,
    FileUploadComponent,
    DatasetComponent,
    InputDialogComponent,
    MessageDialogComponent,
    EvaluationComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        ReactiveFormsModule,
        FormsModule,
        NgOptimizedImage,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
