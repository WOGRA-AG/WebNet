import { Component } from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'webnet-builder-frontend';

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

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
}
