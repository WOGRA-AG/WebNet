import {Component, HostListener} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
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
  title = 'webnet-builder-frontend';

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private projectService: ProjectService) {}


  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(e: BeforeUnloadEvent): void {
    const lastModifiedTime = new Date(this.projectService.projectInfo().lastModified).getTime();
    const currentTime = new Date().getTime();
    const timeDifferenceInSeconds = (currentTime - lastModifiedTime) / 1000;
    if (timeDifferenceInSeconds > 60) {
      e.returnValue = 'You have open Projects. Are you sure you want to leave?';
    }
  }

  getPageTitle(): string {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const pageTitle = route.snapshot.data['pageTitle'];
    if (pageTitle) {
      return pageTitle;
    } else {
      const pathSegments = route.snapshot.url.map(segment => segment.path);
      return pathSegments.join(' / ');
    }
  }

  getPageDesciption(): string {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const pageDesc = route.snapshot.data['desc'];
    if (pageDesc) {
      return pageDesc;
    } else {
      const pathSegments = route.snapshot.url.map(segment => segment.path);
      return pathSegments.join(' / ');
    }
  }

  getNumberOfProjects(): number {
    return this.projectService.getNumberOfProjects();
  }
}
