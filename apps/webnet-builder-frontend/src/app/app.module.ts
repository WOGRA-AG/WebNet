import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './pages/home/home.component';
import { TestingComponent } from './pages/testing/testing.component';
import { TrainingContainerComponent } from './shared/components/training-container/training-container.component';
import {ReactiveFormsModule} from "@angular/forms";
import { NnBuilderComponent } from './pages/nn-builder/nn-builder.component';
import { DynamicLayerFormComponent } from './shared/components/dynamic-layer-form/dynamic-layer-form.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TestingComponent,
    TrainingContainerComponent,
    NnBuilderComponent,
    DynamicLayerFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
