import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {TestingComponent} from "./pages/testing/testing.component";
import {NnBuilderComponent} from "./pages/nn-builder/nn-builder.component";

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'home',  redirectTo: '', pathMatch: 'full'},
  {path: 'testing', component: TestingComponent, pathMatch:'full', data: { pageTitle: 'Performance Tests', desc: 'Measure the performance of different backends for different neural network examples.'}},
  {path: 'builder', component: NnBuilderComponent, pathMatch: 'full', data: { pageTitle: 'Neural Network Builder', desc: 'build a custom neural network'}},
  {path: '**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
