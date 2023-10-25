import {Component} from '@angular/core';
import {SerializationService} from "../../core/services/serialization.service";
import {Router} from "@angular/router";
import {ProjectService} from "../../core/services/project.service";
import {MatDialog} from "@angular/material/dialog";
import {InputDialogComponent} from "../../shared/components/input-dialog/input-dialog.component";
import {LayerType, StorageOption} from "../../core/enums";
import {v4 as uuidv4} from 'uuid';
import {KeyValue} from "@angular/common";

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  file: File | undefined;
  projects: Map<string, any> = new Map();
  templateProjects: string[] = ['mnist'];
  selectedTemplateProject: string | undefined;

  constructor(private serializationService: SerializationService, protected projectService: ProjectService, private router: Router, private dialog: MatDialog) {
    this.projectService.projectSubject.subscribe((project: any) => {
      this.projects = this.projectService.getMyProjects();
    })

  }

  lastModifiedOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    const dateA = new Date(a.value.projectInfo.lastModified);
    const dateB = new Date(b.value.projectInfo.lastModified);
    return dateB.getTime() - dateA.getTime();
  }


  addFile(file: File): void {
    this.file = file;
  }

  generateProjectId(): string {
    return uuidv4();
  }

  async createNewProject(): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {message: 'Create a fresh Project.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        // const data = [
        //   {
        //     position: 1,
        //     label: '1',
        //     title: 'Stuning even for the non-gamer',
        //     content: 'This sound track was beautiful! It paints the senery in your mind so well I would recomend it even to people who hate vid. game music! I have played the game Chrono Cross but out of all of the games I have ever played it has the best music! It backs away from crude keyboarding and takes a fresher step with grate guitars and soulful orchestras. It would impress anyone who cares to listen! ^_^'
        //   },
        //   {
        //     position: 2,
        //     label: '1',
        //     title: 'The best soundtrack ever to anything.',
        //     content: 'I\'m reading a lot of reviews saying that this is the best \'game soundtrack\' and I figured that I\'d write a review to disagree a bit. This in my opinino is Yasunori Mitsuda\'s ultimate masterpiece. The music is timeless and I\'m been listening to it for years now and its beauty simply refuses to fade.The price tag on this is pretty staggering I must say, but if you are going to buy any cd for this much money, this is the only one that I feel would be worth every penny.'
        //   },
        //   {
        //     position: 3,
        //     label: '1',
        //     title: 'Amazing!',
        //     content: 'This soundtrack is my favorite music of all time, hands down. The intense sadness of "Prisoners of Fate" (which means all the more if you\'ve played the game) and the hope in "A Distant Promise" and "Girl who Stole the Star" have been an important inspiration to me personally throughout my teen years. The higher energy tracks like "Chrono Cross ~ Time\'s Scar~", "Time of the Dreamwatch", and "Chronomantique" (indefinably remeniscent of Chrono Trigger) are all absolutely superb as well.This soundtrack is amazing music, probably the best of this composer\'s work (I haven\'t heard the Xenogears soundtrack, so I can\'t say for sure), and even if you\'ve never played the game, it would be worth twice the price to buy it.I wish I could give it 6 stars.'
        //   },
        //   {
        //     position: 4,
        //     label: '1',
        //     title: 'Excellent Soundtrack',
        //     content: 'I truly like this soundtrack and I enjoy video game music. I have played this game and most of the music on here I enjoy and it\'s truly relaxing and peaceful.On disk one. my favorites are Scars Of Time, Between Life and Death, Forest Of Illusion, Fortress of Ancient Dragons, Lost Fragment, and Drowned Valley.Disk Two: The Draggons, Galdorb - Home, Chronomantique, Prisoners of Fate, Gale, and my girlfriend likes ZelbessDisk Three: The best of the three. Garden Of God, Chronopolis, Fates, Jellyfish sea, Burning Orphange, Dragon\'s Prayer, Tower Of Stars, Dragon God, and Radical Dreamers - Unstealable Jewel.Overall, this is a excellent soundtrack and should be brought by those that like video game music.Xander Cross'
        //   },
        //   {
        //     position: 5,
        //     label: '1',
        //     title: 'Remember, Pull Your Jaw Off The Floor After Hearing it',
        //     content: 'If you\'ve played the game, you know how divine the music is! Every single song tells a story of the game, it\'s that good! The greatest songs are without a doubt, Chrono Cross: Time\'s Scar, Magical Dreamers: The Wind, The Stars, and the Sea and Radical Dreamers: Unstolen Jewel. (Translation varies) This music is perfect if you ask me, the best it can be. Yasunori Mitsuda just poured his heart on and wrote it down on paper.'
        //   },
        //   {
        //     position: 6,
        //     label: '1',
        //     title: 'an absolute masterpiece',
        //     content: 'I am quite sure any of you actually taking the time to read this have played the game at least once, and heard at least a few of the tracks here. And whether you were aware of it or not, Mitsuda\'s music contributed greatly to the mood of every single minute of the whole game.Composed of 3 CDs and quite a few songs (I haven\'t an exact count), all of which are heart-rendering and impressively remarkable, this soundtrack is one I assure you you will not forget. It has everything for every listener -- from fast-paced and energetic (Dancing the Tokage or Termina Home), to slower and more haunting (Dragon God), to purely beautifully composed (Time\'s Scar), to even some fantastic vocals (Radical Dreamers).This is one of the best videogame soundtracks out there, and surely Mitsuda\'s best ever. ^_^'
        //   },
        //   {
        //     position: 7,
        //     label: '0',
        //     title: 'Buyer beware',
        //     content: 'This is a self-published book, and if you want to know why--read a few paragraphs! Those 5 star reviews must have been written by Ms. Haddon\'s family and friends--or perhaps, by herself! I can\'t imagine anyone reading the whole thing--I spent an evening with the book and a friend and we were in hysterics reading bits and pieces of it to one another. It is most definitely bad enough to be entered into some kind of a "worst book" contest. I can\'t believe Amazon even sells this kind of thing. Maybe I can offer them my 8th grade term paper on "To Kill a Mockingbird"--a book I am quite sure Ms. Haddon never heard of. Anyway, unless you are in a mood to send a book to someone as a joke---stay far, far away from this one!'
        //   },
        //   {
        //     position: 8,
        //     label: '0',
        //     title: 'The Worst!',
        //     content: 'A complete waste of time. Typographical errors, poor grammar, and a totally pathetic plot add up to absolutely nothing. I\'m embarrassed for this author and very disappointed I actually paid for this book.'
        //   },
        // ];
        // todo: add explaination, hover tooltip
        // CRIM - per capita crime rate by town
        // ZN - proportion of residential land zoned for lots over 25,000 sq.ft.
        //   INDUS - proportion of non-retail business acres per town.
        //   CHAS - Charles River dummy variable (1 if tract bounds river; 0 otherwise)
        // NOX - nitric oxides concentration (parts per 10 million)
        // RM - average number of rooms per dwelling
        // AGE - proportion of owner-occupied units built prior to 1940
        // DIS - weighted distances to five Boston employment centres
        // RAD - index of accessibility to radial highways
        // TAX - full-value property-tax rate per $10,000
        // PTRATIO - pupil-teacher ratio by town
        // B - 1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town
        // LSTAT - % lower status of the population
        // MEDV - Median value of owner-occupied homes in $1000's
        const data = [
          {
            CRIM: 0.00632, ZN: 18.0, INDUS: 2.31, CHAS: 0, NOX: 0.5380, RM: 6.5750, AGE: 65.20, DIS: 4.0900, RAD: 1, TAX: 296.0, PTRATIO: 15.30, B: 396.90, LSTAT: 4.98, MEDV: 24.00,
          },
          {
            CRIM: 0.02731, ZN: 0.00, INDUS: 7.07, CHAS: 0, NOX: 0.4690, RM: 6.4210, AGE: 78.90, DIS: 4.9671, RAD: 2, TAX: 242.0, PTRATIO: 17.80, B: 396.90, LSTAT: 9.14, MEDV: 21.60,
          },
          {
            CRIM: 0.02729, ZN: 0.00, INDUS: 7.07, CHAS: 0, NOX: 0.4690, RM: 7.1850, AGE: 61.10, DIS: 4.9671, RAD: 2, TAX: 242.0, PTRATIO: 17.80, B: 392.83, LSTAT: 4.03, MEDV: 34.70,
          },
          {
            CRIM: 0.03237, ZN: 0.00, INDUS: 2.18, CHAS: 0, NOX: 0.4580, RM: 6.9980, AGE: 45.80, DIS: 6.0622, RAD: 3, TAX: 222.0, PTRATIO: 18.70, B: 394.63, LSTAT: 2.94, MEDV: 33.40,
          },
          {
            CRIM: 0.06905, ZN: 0.00, INDUS: 2.18, CHAS: 0, NOX: 0.4580, RM: 7.1470, AGE: 54.20, DIS: 6.0622, RAD: 3, TAX: 222.0, PTRATIO: 18.70, B: 396.90, LSTAT: 5.33,MEDV: 36.20,
          },
          {
            CRIM: 0.02985, ZN: 0.00, INDUS: 2.18, CHAS: 0, NOX: 0.4580, RM: 6.4300, AGE: 58.70, DIS: 6.0622, RAD: 3, TAX: 222.0, PTRATIO: 18.70, B: 394.12, LSTAT: 5.21, MEDV: 28.70,
          },
          {
            CRIM: 0.08829, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 6.0120, AGE: 66.60, DIS: 5.5605, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 395.60, LSTAT: 12.43, MEDV: 22.90,
          },
          {
            CRIM: 0.14455, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 6.1720, AGE: 96.10, DIS: 5.9505, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 396.90, LSTAT: 19.15, MEDV: 27.10,
          },
          {
            CRIM: 0.21124, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 5.6310, AGE: 100.00, DIS: 6.0821, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 386.63, LSTAT: 29.93, MEDV: 16.50,
          },
          {
            CRIM: 0.17004, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 6.0040, AGE: 85.90, DIS: 6.5921, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 386.71, LSTAT: 17.10, MEDV: 18.90,
          },
          {
            CRIM: 0.22489, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 6.3770, AGE: 94.30, DIS: 6.3467, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 392.52,
            LSTAT: 20.45, MEDV: 15.00,
          },
          {
            CRIM: 0.11747, ZN: 12.50, INDUS: 7.87, CHAS: 0, NOX: 0.5240, RM: 6.0090, AGE: 82.90, DIS: 6.2267, RAD: 5, TAX: 311.0, PTRATIO: 15.20, B: 396.90, LSTAT: 13.27, MEDV: 18.90,
          },];
        this.projectService.addProject(
          {
            projectInfo: {
              id: this.generateProjectId(),
              name: projectName,
              lastModified: new Date(),
              storeLocation: StorageOption.InMemory
            },
            dataset: {type: 'text', data: data},
            trainConfig: {
              optimizer: 'adam',
              learningRate: 0.01,
              loss: 'meanSquaredError',
              accuracyPlot: true,
              lossPlot: false
            },
            builder: {layers: [{type: LayerType.Input}, {type: LayerType.Output}], connections: []}
          });
        await this.router.navigate([`/projects/${projectName}`])
      }
    });
  }

  async createProjectFromTemplate(template: string): Promise<void> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {message: 'Create a Project from Template.'}
    });
    dialogRef.afterClosed().subscribe(async (projectName) => {
      if (projectName) {
        const projectData = this.projectService.getTemplateProjectByName(template);
        projectData.projectInfo.id = this.generateProjectId();
        projectData.projectInfo.name = projectName;
        this.projectService.addProject(projectData);
        await this.router.navigate([`/projects/${projectName}`])
      }
    });
  }

  async importProject(): Promise<void> {
    if (this.file) {
      const project = await this.serializationService.importZip(this.file);
      this.projectService.addProject(project);
      await this.router.navigate([`/projects/${project.projectInfo.name}`]);
    }
  }
}
