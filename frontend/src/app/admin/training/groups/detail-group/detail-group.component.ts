import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupModel} from "../../../../../models/training.model";
import {Subscription} from "rxjs";
import {GroupService} from "../../../../_services/group.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {TrainingService} from "../../../../_services/training.service";
import {MatCheckboxChange} from "@angular/material/checkbox";
import {MatSnackBar} from "@angular/material/snack-bar";
import {LifecycleDocumentsDialogComponent} from "../../group/group.component";

export interface Step {
  key: string;
  label: string;
}

@Component({
  selector: 'app-detail-group',
  templateUrl: './detail-group.component.html',
  styleUrl: './detail-group.component.scss'
})
export class DetailGroupComponent implements OnInit, OnDestroy {
  idGroup!: number;
  group!: any
  presenceBytes!: Uint8Array | undefined
  evaluationBytes!: Uint8Array | undefined
  referenceBytes!: Uint8Array | undefined
  pdfUrl!: string | null;
  presenceUrl!: string | null;
  evaluationUrl!: string | null;
  referenceUrl!: string | null;
  steps: Step[] = [
    {key: 'Recherche_formateur', label: 'Recherche formateur'},
    {key: 'Validation_formateur', label: 'Validation formateur'},
    {key: 'Reunion_de_cadrage', label: 'Réunion de cadrage'},
    {key: 'Support_de_formation', label: 'Support de formation'},
    {key: 'Impression', label: 'Impression'},
    {key: 'Realisation', label: 'Réalisation de la formation'},
    {key: 'Attestation', label: 'Livrable de formation'},
    {key: 'Facturation', label: 'Facturation de la formation'},
    {key: 'Reglement', label: 'Règlement de la facture'},
    {key: 'Realisée', label: 'Attestation de référence'},
  ];
  disabledSteps: Set<string> = new Set();
  private subscriptions: Subscription[] = [];

  constructor(private groupService: GroupService,
              private router: Router,
              private dialog: MatDialog,
              private trainingService: TrainingService,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,) {
    this.idGroup = this.route.snapshot.params['idGroup'];
  }

  ngOnInit() {
    this.loadGroup();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadGroup() {
    const groupSubscription = this.groupService.getGroup(this.idGroup)
      .subscribe({
        next: group => {
          this.group = group;
          // this.convertLogoToBytes()
        },
        error: error => {
          console.log(error.message);
        }
      });
    this.subscriptions.push(groupSubscription);
  }

  getPresenceListUrl() {
    return this.presenceUrl
  }

  getEvaluationUrl() {
    return this.evaluationUrl
  }

  getReferenceUrl() {
    return this.referenceUrl
  }

  /***************************** Cycle de vie **********************************/

  openDocumentsLifeCycleDialog(action: string, group: GroupModel, step: string, event: MatCheckboxChange) {
    const dialogRef = this.dialog.open(LifecycleDocumentsDialogComponent, {
      data: {
        obj: group,
        action: action,
      }
    })
    const openDocumentsLifeCycleSubscription = dialogRef.afterClosed().subscribe((result) => {
      if (result.event != "Cancel") {
        this.group.status = step;
        this.updateStatus(this.idGroup, this.group.status);
      }

      if (result.event == "Cancel") {
        event.source.checked = false;
      }
    })

    this.subscriptions.push(openDocumentsLifeCycleSubscription)
  }

  isStepChecked(step: string): boolean {
    const currentStepIndex = this.getStepIndex(this.group.status);
    const stepIndex = this.getStepIndex(step);
    return stepIndex <= currentStepIndex;
  }

  isStepDisabled(step: string): boolean {
    const currentStepIndex = this.getStepIndex(this.group.status);
    const stepIndex = this.getStepIndex(step);

    // Désactiver tous les statuts après le statut actif
    return stepIndex > currentStepIndex + 1;
  }

  onStepChange(step: Step, event: MatCheckboxChange) {
    const stepIndex = this.getStepIndex(step.key);

    if (event.checked) {
      // Si on coche une étape, s'assurer que la précédente est bien validée
      if (stepIndex === this.getStepIndex(this.group.status) + 1) {
        if (step.key === 'Validation_formateur' && !this.group.idSupplier) {
          this.snackBar.open('Aucun formateur associé', 'Fermer', {duration: 3000});
          event.source.checked = false; // Annuler la sélection
          return;
        }
        if (step.key === 'Reunion_de_cadrage') {
          this.trainingService.hasPV(this.group.idTraining).subscribe(
            hasPV => {
              if (!hasPV) {
                this.openDocumentsLifeCycleDialog("pv", this.group, step.key, event)
              } else {
                this.group.status = step.key;
              }
            }
          )
          return;
        }
        if (step.key === 'Support_de_formation') {
          this.trainingService.hasTrainingSupport(this.group.idTraining).subscribe(
            hasTrainingSupport => {
              if (!hasTrainingSupport) {
                this.openDocumentsLifeCycleDialog("trainingSupport", this.group, step.key, event)
              } else {
                this.group.status = step.key;
              }
            }
          )
          return;
        }
        if (step.key === 'Realisation') {
          // event.source.checked = false;
          this.openDocumentsLifeCycleDialog("trainingNotes", this.group, step.key, event)
          return;
        }
        if (step.key === 'Attestation') {
          this.openDocumentsLifeCycleDialog("referenceCertificate", this.group, step.key, event)
          return;
        }
        if (step.key === 'Facturation') {
          this.groupService.updateGroupStatus(this.group.idGroup, 'Attestation')
            .subscribe({
              next: () => {
                this.router.navigate([`invoicing/edit-group-invoice/${this.group.idGroup}`]);
              },
            });
          return;
        }
        this.group.status = step.key;
        this.updateStatus(this.group.idGroup, this.group.status);
      }
    } else {
      // Si on décoche, décocher et désactiver tous les statuts suivants
      this.group.status = this.getStepName(stepIndex - 1);
      for (let i = stepIndex; i < this.steps.length; i++) {
        this.group[this.steps[i].key] = false; // Décocher
        this.disabledSteps.add(this.steps[i].key); // Désactiver
      }

    }
  }

  updateStatus(groupId: number, status: string) {
    this.groupService.updateGroupStatus(groupId, status).subscribe({
      next: () => {
      },
      error: error => {
        console.log(error.message);
      }
    })
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

  /***************************** Cycle de vie **********************************/

  // Group documents
  private convertLogoToBytes() {
    if (this.group && this.group.presenceList) {
      // @ts-ignore
      const byteCharacters = atob(this.training.presenceList);
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      this.presenceBytes = new Uint8Array(byteNumbers);
      this.createPresenceUrl();
    }
    if (this.group && this.group.evaluation) {
      // @ts-ignore
      const byteCharacters = atob(this.training.evaluation);
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      this.evaluationBytes = new Uint8Array(byteNumbers);
      this.createEvaluationUrl();
    }

    if (this.group && this.group.referenceCertificate) {
      console.log("k,zee,k,k,cdc,dk,dkc,")
      // @ts-ignore
      const byteCharacters = atob(this.training.referenceCertificate);
      const byteNumbers = new Array(byteCharacters.length)

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      this.referenceBytes = new Uint8Array(byteNumbers);
      this.createReferenceUrl();
    }
  }

  private createPresenceUrl() {
    if (this.presenceBytes) {
      const blob = new Blob([this.presenceBytes], {type: 'application/pdf'});
      this.presenceUrl = URL.createObjectURL(blob);
    } else {
      this.presenceUrl = null;
    }
  }

  private createEvaluationUrl() {
    if (this.evaluationBytes) {
      const blob = new Blob([this.evaluationBytes], {type: 'application/pdf'});
      this.evaluationUrl = URL.createObjectURL(blob);
    } else {
      this.evaluationUrl = null;
    }
  }

  // removeTrainingSupport() {
  //   const removeTrainingSupportSubscription = this.groupService.removeTrainingSupport(this.group.idTraining, this.group).subscribe({
  //     next: data => {
  //       this.updateLifeCycle(this.group)
  //         .then(() => {
  //           console.log(data)
  //         })
  //         .catch(err => {
  //           console.log(err.message);
  //         });
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   })
  //   this.subscriptions.push(removeTrainingSupportSubscription)
  // }

  // removeTrainingNotes() {
  //   const removeTrainingNotesSubscription = this.groupService.removeTrainingNotes(this.group.idTraining, this.group).subscribe({
  //     next: data => {
  //       this.updateLifeCycle(this.group)
  //         .then(() => {
  //         })
  //         .catch(err => {
  //           console.log(err.message);
  //         });
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   })
  //   this.subscriptions.push(removeTrainingNotesSubscription)
  // }

  // removeReferenceCertificate() {
  //   const removeReferenceCertificateSubscription = this.groupService.removeReferenceCertificate(this.group.idTraining, this.group).subscribe({
  //     next: data => {
  //       this.updateLifeCycle(this.group)
  //         .then(() => {
  //         })
  //         .catch(err => {
  //           console.log(err.message);
  //         });
  //     },
  //     error: error => {
  //       console.log(error.message)
  //     }
  //   })
  //   this.subscriptions.push(removeReferenceCertificateSubscription)
  // }

  private createReferenceUrl() {
    if (this.referenceBytes) {
      const blob = new Blob([this.referenceBytes], {type: 'application/pdf'});
      this.referenceUrl = URL.createObjectURL(blob);
    } else {
      this.referenceUrl = null;
    }
  }

  //Réinitialiser les checkbox en cas d'erreur
  private resetCheckboxes(currentCheckbox: string) {
    const checkboxOrder = [
      'trainerSearch',
      'trainerValidation',
      'kickOfMeeting',
      'trainingSupport',
      'impression',
      'completion',
      'certif',
      'invoicing',
      'payment'
    ];

    const currentIndex = checkboxOrder.indexOf(currentCheckbox);
    if (currentIndex !== -1) {
      for (let i = currentIndex + 1; i < checkboxOrder.length; i++) {
        // @ts-ignore
        this.group.groupLifeCycle[checkboxOrder[i]] = false;
      }
    }
  }
}
