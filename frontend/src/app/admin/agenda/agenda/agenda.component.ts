import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {CalendarEvent} from "angular-calendar";
import {differenceInDays, isSameDay, isSameMonth} from "date-fns";
import {Router} from "@angular/router";
import {TrainingService} from "../../../_services/training.service";
import {TrainingModel} from "../../../../models/training.model";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Subscription} from "rxjs";
import {CustomCalendarEvent} from "../../../../models/custom-calendar.model";

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit, OnDestroy {
  viewDate: Date = new Date();
  view: any = 'month';
  activeDayIsOpen: boolean = false
  events: CustomCalendarEvent[] = []
  trainings!: Array<TrainingModel>
  selectedEvent: CustomCalendarEvent | undefined;
  selectedTraining!: TrainingModel
  colors: any[] = []
  private subscriptions: Subscription[] = [];

  constructor(private trainingService: TrainingService,
              private router: Router,
              public dialog: MatDialog) {
  }

  ngOnInit() {
    this.getTrainings()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  /*****************************************************/
  getTrainings() {
    const trainingsSubscription = this.trainingService.getTrainings()
      .subscribe({
        next: data => {
          this.trainings = data;
          this.events = [];

          this.trainings.forEach(training => {
            // Traiter chaque groupe de la formation
            training.groups.forEach(group => {
              if (group.startDate && group.endDate) {
                // Cas des dates consécutives
                const event: CustomCalendarEvent = {
                  id: training.idTraining,
                  groupId: group.idGroup,
                  title: training.theme,
                  start: new Date(group.startDate),
                  end: new Date(group.endDate),
                  bgColor: training.client.color,
                  isConsecutive: true,
                  allDay: true
                };
                this.events.push(event);
              } else if (group.groupDates && group.groupDates.length > 0) {
                // Cas des dates non consécutives
                group.groupDates.forEach(date => {
                  const event: CustomCalendarEvent = {
                    id: training.idTraining,
                    groupId: group.idGroup,
                    title: training.theme,
                    start: new Date(date),
                    end: new Date(date),
                    bgColor: training.client.color,
                    isConsecutive: false,
                    allDay: true
                  };
                  this.events.push(event);
                });
              }
            });
          });

          // Forcer la mise à jour du calendrier
          this.events = [...this.events];
        },
        error: err => {
          this.events = [];
          console.error(err.message);
        }
      });
    this.subscriptions.push(trainingsSubscription);
  }

// Helper function to check if two dates are on the same day
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /******************************************************/

  dayClicked({date, events}: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.activeDayIsOpen = !((isSameDay(this.viewDate, date) && this.activeDayIsOpen) ||
        events.length === 0);
      this.viewDate = date;
    }
  }

  // Méthode pour afficher les détails de l'événement sélectionné
  showEventDetails(event: CustomCalendarEvent): void {
    this.selectedEvent = event;
  }

  // calendar.component.ts

  calcEventWidth(event: CalendarEvent, day: Date): number {
    // @ts-ignore
    const totalDays = differenceInDays(event.end, event.start) + 1;
    const daysSoFar = differenceInDays(day, event.start);
    return (1 / totalDays) * 100 * (daysSoFar + 1);
  }

  eventClicked(event: CustomCalendarEvent) {
    // Récupérer la formation et le groupe spécifique
    const training = this.trainings.find(t => t.idTraining === event.id);
    if (training) {
      const group = training.groups.find(g => g.idGroup === event.groupId);
      this.selectedTraining = {
        ...training,
        groups: group ? [group] : [] // Ne montrer que le groupe sélectionné
      };
      this.openDialog();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TrainingDialog, {
      data: {
        obj: this.selectedTraining
      }
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result.data) {
        this.router.navigate(['/training/detail/' + result.data.idTraining]);
      }
    })
  }

  getTraining(idTraining: number) {
    this.trainingService.getTraining(idTraining)
      .subscribe({
        next: training => {
          this.selectedTraining = training
          this.openDialog()
        },
        error: error => {
          console.log(error.message)
        }
      })
  }

  getColorById(id: number) {
    const colorObj = this.colors.find(color => color.id === id);
    return colorObj ? colorObj.color : ''; // Retourne la co
  }

  onAddTraining() {
    this.router.navigate(['training/add'])
  }
}

@Component({
  selector: 'app-agenda-dialog',
  templateUrl: 'training-dialog.html'
})

export class TrainingDialog {
  training!: TrainingModel;

  constructor(public dialogRef: MatDialogRef<TrainingDialog>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: { obj: TrainingModel },
  ) {
    this.training = {...data.obj};
  }

  doAction(): void {
    this.dialogRef.close({data: this.training})
  }

  closeDialog(): void {
    this.dialogRef.close({event: 'Cancel'})
  }
}
