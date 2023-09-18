import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {TestingComponent} from "./pages/testing/testing.component";
import {NnBuilderComponent} from "./pages/nn-builder/nn-builder.component";
import {ProjectsComponent} from "./pages/projects/projects.component";
import {CreateProjectComponent} from "./pages/create-project/create-project.component";

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'home',  redirectTo: '', pathMatch: 'full'},
  {path: 'testing', component: TestingComponent, pathMatch:'full', data: { pageTitle: 'Performance Tests', desc: 'Measure the performance of different backends for different neural network examples.'}},
  {path: 'builder', component: NnBuilderComponent, pathMatch: 'full', data: { pageTitle: 'Neural Network Builder', desc: 'build a custom neural network'}},
  {path: 'projects', component: ProjectsComponent, pathMatch: 'full', data: { pageTitle: 'Neural Network Projects', desc: 'build and train a custom neural network model'},},
  {path: 'projects/:test', component: CreateProjectComponent},
  {path: '**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
