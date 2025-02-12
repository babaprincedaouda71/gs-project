import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ClientService} from "../../../../_services/client.service";
import {InvoicingService} from "../../../../_services/invoicing.service";
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {KeycloakService} from "keycloak-angular";
import {ClientModel} from "../../../../../models/client.model";
import {MatTableDataSource} from "@angular/material/table";
import {GroupInvoiceModel, GroupModel} from "../../../../../models/training.model";
import {SelectionModel} from "@angular/cdk/collections";
import {KeycloakProfile} from "keycloak-js";
import {referenceValidator} from "../../../../_validators/invoice-format.validator";
import {GroupService} from "../../../../_services/group.service";
import {GroupInvoice} from "../../../../../models/invoice.model";

@Component({
  selector: 'app-edit-groups-invoice',
  templateUrl: './edit-groups-invoice.component.html',
  styleUrl: './edit-groups-invoice.component.scss'
})
export class EditGroupsInvoiceComponent implements OnInit, OnDestroy {

  // Variables de données pour le formulaire, les formations et le client
  editGroupsInvoiceForm!: FormGroup;
  selectedDate: Date = new Date(); // Date sélectionnée pour la facture
  invoiceNumber: string = ''; // Numéro de facture
  client!: ClientModel; // Données du client lié à la facture
  displayedColumns: string[] = ['client', 'theme', 'group', 'staff', 'amount']; // Colonnes pour l'affichage des formations
  datasource!: MatTableDataSource<GroupInvoiceModel>; // Source de données pour la table
  selection = new SelectionModel<GroupModel>(true, []); // Sélection des groupes dans la table
  groups!: Array<GroupInvoiceModel>; // Liste des groupes associés aux formations
  selectedGroupIds: Array<number> = []; // Identifiants des groupes sélectionnés
  deadline!: number; // Délai de paiement
  amount: number = 0; // Montant HT total de la facture
  tva!: number; // TVA calculée sur le montant
  ttc!: number; // Montant TTC
  travelF!: number; // Frais de déplacement

  private subscriptions: Subscription[] = []; // Liste des abonnements pour la gestion de mémoire
  private userProfile!: KeycloakProfile; // Profil utilisateur connecté

  // Constructeur injectant les services nécessaires
  constructor(
    private invoicingService: InvoicingService,
    private router: Router,
    private formBuilder: FormBuilder,
    private keycloakService: KeycloakService,
    private groupService: GroupService,
    private clientService: ClientService,
  ) {
  }

  // Méthode appelée lors de l'initialisation du composant
  ngOnInit() {
    const selectedGroupIds = localStorage.getItem('selectedGroupIds');
    if (selectedGroupIds) {
      // Charge les formations filtrées pour les groupes sélectionnés
      this.selectedGroupIds = JSON.parse(selectedGroupIds);
      this.getGroupsByIds(this.selectedGroupIds);
    }
    // Charge le profil utilisateur
    this.getUserProfile();
  }

  // Méthode appelée à la destruction du composant pour libérer les abonnements
  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getGroupsByIds(groupIds: Array<number>) {
    const groupSubscription = this.groupService.getGroupsByIds(groupIds)
      .subscribe({
        next: data => {
          this.groups = data
          this.datasource = new MatTableDataSource(this.groups)
          this.calculateAmountHT(this.groups)
          this.getClient(this.groups[0].idClient)
          this.updateInvoiceNumber()
        },
        error: error => {
        }
      })
    this.subscriptions.push(groupSubscription);
  }

  // Calcule le montant HT total de la facture à partir des formations
  calculateAmountHT(groups: GroupInvoiceModel[]) {
    groups.forEach(group => {
      this.amount += group.groupAmount;
    });
  }

  // Récupère les informations du client à partir de l'identifiant du client
  getClient(clientId: number) {
    const clientSubs = this.clientService.getClient(clientId).subscribe({
      next: value => {
        this.client = value;
        this.deadline = this.client.deadline; // Définit le délai de paiement
        this.buildForm(); // Construit le formulaire avec les informations du client
      },
      error: err => console.error(err.message)
    });
    this.subscriptions.push(clientSubs);
  }


  // Construit le formulaire de modification de la facture
  buildForm() {
    this.editGroupsInvoiceForm = this.formBuilder.group({
      idClient: [this.client.corporateName],
      numberInvoice: [this.invoiceNumber, [referenceValidator(this.selectedDate)]],
      createdAt: [new Date(), [Validators.required, Validators.minLength(6)]],
      travelFees: ['', [Validators.required]],
      addDeadline: [true],
    });

    // Calcule la TVA sur le montant HT
    this.tva = this.amount * 0.2;

    // Abonnement aux modifications des frais de déplacement
    const travelExpensesSubscription = this.editGroupsInvoiceForm.get('travelFees')?.valueChanges.subscribe((travelFees) => {
      this.travelF = this.editGroupsInvoiceForm.get('travelFees')?.value;
      // Calcule le montant TTC en ajoutant la TVA et les frais de déplacement
      this.ttc = this.tva + this.travelF + this.amount;
    });

    if (travelExpensesSubscription) {
      this.subscriptions.push(travelExpensesSubscription);
    }
  }

  // Met à jour le numéro de facture en fonction de la date sélectionnée
  updateInvoiceNumber() {
    const year = this.selectedDate.getFullYear() % 100; // Récupère les deux derniers chiffres de l'année
    const month = this.selectedDate.getMonth() + 1; // Les mois commencent à 0 en JS

    this.invoicingService.getNextInvoiceNumber(year, month).subscribe((nextNum: string) => {
      this.invoiceNumber = nextNum;
    });
  }

  // Méthode déclenchée lors de la modification de la date
  onDateChange(event: any) {
    this.selectedDate = event.value;
    this.updateInvoiceNumber();
  }

  // Charge le profil utilisateur si l'utilisateur est connecté
  getUserProfile() {
    if (this.keycloakService.isLoggedIn()) {
      this.keycloakService.loadUserProfile().then(profile => {
        this.userProfile = profile;
      });
    }
  }

  // Soumet la facture de groupes en enregistrant les données
  onSubmit() {
    const groupsInvoice: GroupInvoice = {
      numberInvoice: this.invoiceNumber,
      idClient: this.client.idClient,
      groupsIds: this.selectedGroupIds,
      editor: this.userProfile.firstName + ' ' + this.userProfile.lastName,
      ht: this.amount,
      tva: this.tva,
      travelFees: this.travelF,
      ttc: this.ttc,
      createdAt: this.editGroupsInvoiceForm.get('createdAt')?.value,
      addDeadline : this.editGroupsInvoiceForm.get('addDeadline')?.value,
    };

    const saveInvoiceSubscription = this.invoicingService.saveGroupsInvoice(groupsInvoice).subscribe({
      next: data => {
        const updateSubscription = this.groupService.updateGroupsStatus(data.groupsIds)
          .subscribe({
            next: data => {
              this.router.navigate(['/invoicing'])
            },
            error: error => {
              console.log(error.message);
            }
          })
        this.subscriptions.push(updateSubscription);
      },
      error: err => console.log(err.message)
    });
    this.subscriptions.push(saveInvoiceSubscription);
  }
}
