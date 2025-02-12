import {Component, Inject, OnDestroy, OnInit, Optional, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {GroupModel} from "../../../../models/training.model";
import {DatesService} from "../../../_services/dates.service";
import {Subscription} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {GroupService} from "../../../_services/group.service";
import {TrainingService} from "../../../_services/training.service";
import {ErrorDialogComponent} from "./error-dialog/error-dialog.component";
import {MatCheckboxChange} from "@angular/material/checkbox";

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrl: './group.component.scss'
})
export class GroupComponent implements OnInit, OnDestroy {
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator = Object.create(null);
  displayedColumns: string[] = ['group', 'supplier', 'dates', 'staff', 'status', 'action'];
  groups!: Array<GroupModel>

  private subscriptions: Subscription[] = []

  constructor(private groupService: GroupService,
              public dateService: DatesService,
              public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.getGroups()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  getGroups() {
    const groupSubscription = this.groupService.getGroups().subscribe({
      next: data => {
        this.groups = data
        console.log(data)
        this.dataSource = new MatTableDataSource(this.groups)
        this.dataSource.paginator = this.paginator
      }
    })
    this.subscriptions.push(groupSubscription)
  }

  /* Group Life Cycle*/
  openLifeCycleDialog(action: string, obj: GroupModel) {
    const dialogRef = this.dialog.open(LifecycleDialogContentComponent, {
      data: {
        obj: obj,
        action: action
      }
    })
    const openLifeCycleSubscription = dialogRef.afterClosed().subscribe((result) => {
      if (result.event == 'lifeCycle') {
        this.updateLifeCycle(result.data)
        console.log(result.data)
      } else {
        console.log(result.data)
        this.getGroups()
      }
    })

    this.subscriptions.push(openLifeCycleSubscription)
  }

  // Update group life cycle
  updateLifeCycle(group: GroupModel) {
    const updateLifeCycleSubscription = this.groupService.updateLifeCycle(group.idGroup, group)
      .subscribe({
        next: data => {
          this.getGroups()
        },
        error: err => {
          console.log(err.message)
        }
      })
    this.subscriptions.push(updateLifeCycleSubscription)
  }
}

/***/

@Component({
  selector: 'lifecycle-dialog-content',
  templateUrl: 'lifecycle-dialog-content.html',
  styleUrl: './lifecycle-dialog-content.scss'
})

export class LifecycleDialogContentComponent implements OnDestroy {
  action!: string;
  local_data: any
  showTrainingSupportForm: boolean = false;
  showPV: boolean = false;
  pv!: string
  showCertifForm: boolean = false;
  selectedPresenceList!: File
  selectedEvaluation!: File
  initialLifeCycleState: any
  steps: string[] = [
    'Recherche_formateur',
    'Validation_formateur',
    'Reunion_de_cadrage',
    'Support_de_formation',
    'Impression',
    'Realisation',
    'Attestation',
    'Facturation',
    'Reglement',
    'Realisée'
  ];
  disabledSteps: Set<string> = new Set();
  private subscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<LifecycleDialogContentComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
              public dialog: MatDialog,
              private groupService: GroupService,
              private snackBar: MatSnackBar,
              private router: Router,
              private trainingService: TrainingService) {
    this.local_data = {...data.obj}
    this.action = data.action
    // Stockez l'état initial comme une copie profonde immuable
    // this.initialLifeCycleState = JSON.parse(JSON.stringify(this.local_data.groupLifeCycle));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  // Méthode de comparaison profonde pour vérifier si l'état a changé
  hasLifeCycleChanged(): boolean {
    return JSON.stringify(this.local_data.status) !== JSON.stringify(this.initialLifeCycleState);
  }

  doAction() {
    if (!this.hasLifeCycleChanged()) {
      this.dialogRef.close({event: 'Cancel'});
      return;
    }

    // Appel API pour enregistrer le nouveau statut
    this.groupService.updateGroupStatus(this.local_data.idGroup, this.local_data.status)
      .subscribe({
        next: () => {
          this.snackBar.open('Le Cycle de Vie a été mis à jour avec succès', 'Fermer', {
            duration: 4000,
            panelClass: ['green-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.dialogRef.close({event: this.action, data: this.local_data});
        },
        error: () => {
          this.snackBar.open('Erreur lors de l’enregistrement du statut', 'Fermer', {
            duration: 4000,
            panelClass: ['red-snackbar'],
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
  }


  closeDialog(): void {
    if ({event: 'Cancel'}) {
      this.dialogRef.close({event: 'Cancel'});
    } else this.dialogRef.close()
  }

  openErroDialog(obj: GroupModel) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        obj: obj
      }
    })
  }

  /**************************************************************/
  isStepChecked(step: string): boolean {
    const currentStepIndex = this.getStepIndex(this.local_data.status);
    const stepIndex = this.getStepIndex(step);
    return stepIndex <= currentStepIndex;
  }

  isStepDisabled(step: string): boolean {
    const currentStepIndex = this.getStepIndex(this.local_data.status);
    const stepIndex = this.getStepIndex(step);

    // Désactiver tous les statuts après le statut actif
    return stepIndex > currentStepIndex + 1;
  }

  onStepChange(step: string, event: MatCheckboxChange) {
    const stepIndex = this.getStepIndex(step);

    if (event.checked) {
      // Si on coche une étape, s'assurer que la précédente est bien validée
      if (stepIndex === this.getStepIndex(this.local_data.status) + 1) {
        if (step === 'Validation_formateur' && !this.local_data.idSupplier) {
          this.snackBar.open('Aucun formateur associé', 'Fermer', {duration: 3000});
          event.source.checked = false; // Annuler la sélection
          return;
        }
        if (step === 'Reunion_de_cadrage') {
          this.trainingService.hasPV(this.local_data.idTraining).subscribe(
            hasPV => {
              if (!hasPV) {
                this.openDocumentsLifeCycleDialog("pv", this.local_data, step, event)
              } else {
                this.local_data.status = step;
              }
            }
          )
          return;
        }
        if (step === 'Support_de_formation') {
          this.trainingService.hasTrainingSupport(this.local_data.idTraining).subscribe(
            hasTrainingSupport => {
              if (!hasTrainingSupport) {
                this.openDocumentsLifeCycleDialog("trainingSupport", this.local_data, step, event)
              } else {
                this.local_data.status = step;
              }
            }
          )
          return;
        }
        if (step === 'Realisation') {
          this.openDocumentsLifeCycleDialog("trainingNotes", this.local_data, step, event)
          return;
        }
        if (step === 'Attestation') {
          this.openDocumentsLifeCycleDialog("referenceCertificate", this.local_data, step, event)
          return;
        }
        if (step === 'Facturation') {
          this.groupService.updateGroupStatus(this.local_data.idGroup, 'Attestation')
            .subscribe({
              next: () => {
                this.closeDialog()
                this.router.navigate([`invoicing/edit-groups-invoice`])
              },
            });
          return;
        }
        this.local_data.status = step;
        this.disabledSteps.delete(step); // On active le statut coché
      }
    } else {
      // Si on décoche, décocher et désactiver tous les statuts suivants
      this.local_data.status = this.getStepName(stepIndex - 1);
      for (let i = stepIndex; i < this.steps.length; i++) {
        this.local_data[this.steps[i]] = false; // Décocher
        this.disabledSteps.add(this.steps[i]); // Désactiver
      }
    }
  }


  getStepName(index: number): string {
    const steps = [
      'Recherche_formateur',
      'Validation_formateur',
      'Reunion_de_cadrage',
      'Support_de_formation',
      'Impression',
      'Realisation',
      'Attestation',
      'Facturation',
      'Reglement',
      'Realisée'
    ];

    return steps[index] || ''; // Retourne un string vide si l'index est invalide
  }

  getStepIndex(step: string): number {
    const steps = [
      'Recherche_formateur',
      'Validation_formateur',
      'Reunion_de_cadrage',
      'Support_de_formation',
      'Impression',
      'Realisation',
      'Attestation',
      'Facturation',
      'Reglement',
      'Realisée'
    ];
    return steps.indexOf(step);
  }

  openDocumentsLifeCycleDialog(action: string, group: GroupModel, step: string, event: MatCheckboxChange) {
    const dialogRef = this.dialog.open(LifecycleDocumentsDialogComponent, {
      data: {
        obj: group,
        action: action,
      }
    })
    const openDocumentsLifeCycleSubscription = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.local_data.status = step;
        console.log(result);
      } else {
        console.log("Cancel")
        event.source.checked = false; // Annuler la sélection
      }
    })

    this.subscriptions.push(openDocumentsLifeCycleSubscription)
  }

  /**************************************************************/
}

/**/

/*****************************************************************************************/
@Component({
  selector: 'lifecycle-documents-dialog',
  templateUrl: 'lifecycle-documents-dialog.html'
})
export class LifecycleDocumentsDialogComponent {
  action!: string;
  local_data: any
  pv!: string
  selectedTrainingSupport!: File
  selectedReferenceCertificate!: File
  selectedPresenceList!: File
  selectedEvaluation!: File
  private subscriptions: Subscription[] = []

  constructor(public dialogRef: MatDialogRef<LifecycleDialogContentComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
              public dialog: MatDialog,
              private groupService: GroupService) {
    this.local_data = {...data.obj}
    this.action = data.action
    this.selectedTrainingSupport = this.local_data.trainingSupport
  }

  doAction(local_data: GroupModel) {
    this.dialogRef.close({event: this.action, data: local_data});
  }

  closeDialog(): void {
    this.dialogRef.close({event: 'Cancel'});
  }


  onAddPV() {
    this.groupService.addPv(this.pv, this.local_data.idGroup)
      .subscribe({
        next: (value: GroupModel) => {
          this.doAction(value)
        },
        error: err => {
          console.log(err.message)
        }
      })
  }

  onTrainingSupportChange(event: any) {
    if (!event.target.files[0]) return
    this.selectedTrainingSupport = event.target.files[0];
  }

  onSubmitTrainingSupport() {
    const formData: FormData = new FormData()
    if (this.selectedTrainingSupport) {
      formData.append('trainingSupport', this.selectedTrainingSupport)
    }

    this.groupService.addTrainingSupport(formData, this.local_data.idGroup)
      .subscribe({
        next: data => {
          this.doAction(data)
        },
        error: error => {
          console.log(error.message)
        }
      })
  }

  onReferenceCertificateChange(event: any) {
    if (!event.target.files[0]) return
    this.selectedReferenceCertificate = event.target.files[0];
  }

  onSubmitReferenceCertificate() {
    const formData: FormData = new FormData()
    if (this.selectedReferenceCertificate) {
      formData.append('referenceCertificate', this.selectedReferenceCertificate)
    }

    this.groupService.addReferenceCertificate(formData, this.local_data.idGroup)
      .subscribe({
        next: data => {
          this.doAction(data)
        },
        error: error => {
          console.log(error.message)
        }
      })
  }


  onPresenceListChange(event: any) {
    if (!event.target.files[0]) return
    this.selectedPresenceList = event.target.files[0];
  }

  onEvaluationChange(event: any) {
    if (!event.target.files[0]) return
    this.selectedEvaluation = event.target.files[0];
  }


  onSubmitTrainingNotes() {
    const formData: FormData = new FormData()
    if (this.selectedPresenceList) {
      formData.append('presenceList', this.selectedPresenceList)
    }
    if (this.selectedEvaluation) {
      formData.append('evaluation', this.selectedEvaluation)
    }

    this.groupService.addTrainingNotes(formData, this.local_data.idGroup)
      .subscribe({
        next: data => {
          this.doAction(data)
        },
        error: error => {
          console.log(error.message)
        }
      })
  }
}
