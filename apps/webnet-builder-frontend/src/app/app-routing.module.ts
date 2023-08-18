import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {TestingComponent} from "./pages/testing/testing.component";

const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'home',  redirectTo: '', pathMatch: 'full'},
  {path: 'testing', component: TestingComponent, pathMatch:'full'},
  {path: '**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
