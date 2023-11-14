import { Injectable } from '@angular/core';
import {Project} from "../interfaces/project";

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {
  localStorageKey = 'webnet-localstorage-projects';
  constructor() { }

  saveProjectInLocalStorage(name: string, project: Project): void {
    const projects = this.getProjectsFromLocalStorage();
    projects.set(name, project);
    localStorage.setItem(this.localStorageKey,JSON.stringify(Array.from(projects.entries())));
  }
  getProjectsFromLocalStorage(): Map<string, Project> {
    const projectsData = localStorage.getItem(this.localStorageKey);
    return projectsData ? new Map(JSON.parse(projectsData!)) : new Map();
  }

  deleteProjectFromLocalStorage(name: string): boolean {
    const projects = this.getProjectsFromLocalStorage();
    const deleteSuccessfull = projects.delete(name);
    localStorage.setItem(this.localStorageKey, JSON.stringify(Array.from(projects.entries())));
    return deleteSuccessfull;
  }
}
