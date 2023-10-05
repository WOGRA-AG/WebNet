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
import { NnBuilderComponent } from './pages/nn-builder/nn-builder.component';
import { DynamicLayerFormComponent } from './shared/components/dynamic-layer-form/dynamic-layer-form.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectComponent } from './pages/project/project.component';
import { CustomDialogComponent } from './shared/components/custom-dialog/custom-dialog.component';
import { TrainingComponent } from './pages/training/training.component';
import { ExportComponent } from './pages/export/export.component';
import { FileUploadComponent } from './shared/components/file-upload/file-upload.component';




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
    CustomDialogComponent,
    TrainingComponent,
    ExportComponent,
    FileUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
