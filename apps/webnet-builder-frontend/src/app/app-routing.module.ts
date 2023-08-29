import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {TestingComponent} from "./pages/testing/testing.component";
import {NnBuilderComponent} from "./pages/nn-builder/nn-builder.component";

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'home',  redirectTo: '', pathMatch: 'full'},
  {path: 'testing', component: TestingComponent, pathMatch:'full', data: { pageTitle: 'Performance Tests' }},
  {path: 'builder', component: NnBuilderComponent, pathMatch: 'full', data: { pageTitle: 'Neural Network Builder'}},
  {path: '**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
