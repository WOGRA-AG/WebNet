import {NgModule} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatCardModule} from "@angular/material/card";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import { MatInputModule } from '@angular/material/input';

const MaterialComponents =
  [MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatProgressBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule
  ]

@NgModule({
  exports: [MaterialComponents],
  imports: [MaterialComponents]
})
export class MaterialModule {
}
