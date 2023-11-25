import {Component, HostListener} from '@angular/core';
import {ProjectService} from "./core/services/project.service";
import {registerLocaleData} from "@angular/common";
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private projectService: ProjectService) {}


  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(e: BeforeUnloadEvent): void {
    const lastModifiedTime = new Date(this.projectService.projectInfo().lastModified).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInSeconds = (currentTime - lastModifiedTime) / 1000;
    if (timeDifferenceInSeconds > 60) {
      e.returnValue = 'You have open Projects. Are you sure you want to leave?';
    }
  }

  getNumberOfProjects(): number {
    return this.projectService.getNumberOfProjects();
  }
}
