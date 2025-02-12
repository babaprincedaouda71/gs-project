import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupInvoiceModel, GroupModel} from "../../../../../models/training.model";
import {GroupService} from "../../../../_services/group.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {referenceValidator} from "../../../../_validators/invoice-format.validator";
import {ClientModel} from "../../../../../models/client.model";
import {InvoicingService} from "../../../../_services/invoicing.service";
import {GroupInvoice} from "../../../../../models/invoice.model";
import {ClientService} from "../../../../_services/client.service";
import {KeycloakProfile} from "keycloak-js";
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'app-edit-group-invoice',
  templateUrl: './edit-group-invoice.component.html',
  styleUrl: './edit-group-invoice.component.scss'
})
export class EditGroupInvoiceComponent implements OnInit, OnDestroy {
  idGroup!: number;
  group! : GroupModel;
  private subscriptions: Subscription[] = [];
  displayedColumns: string[] = ['client', 'theme', 'group', 'staff', 'amount']; // Colonnes pour l'affichage des formations
  editGroupInvoiceForm!: FormGroup;
  client! : ClientModel
  invoiceNumber: string = '';
  selectedDate: Date = new Date();
  deadline!: number;
  amount: number = 0;
  tva!: number;
  ttc!: number;
  travelF!: number;
  selectedGroupIds: Array<number> = [];
  private userProfile!: KeycloakProfile;

  constructor(
    private groupService: GroupService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private invoicingService: InvoicingService,
    private clientService: ClientService,
    private keycloakService: KeycloakService,
  ) {
    this.idGroup = this.route.snapshot.params['idGroup'];
    this.selectedGroupIds.push(this.idGroup)
  }

  ngOnInit() {
    this.getGroup()
    this.getUserProfile()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getGroup() {
    const groupSubscription = this.groupService.getGroup(this.idGroup)
    .subscribe(group => {
      this.group = group;
      this.amount = group.groupAmount;
      // @ts-ignore
      this.getClient(this.group.idClient)
      this.updateInvoiceNumber();
    })
    this.subscriptions.push(groupSubscription);
  }

  getClient(clientId: number) {
    const clientSubs = this.clientService.getClient(clientId).subscribe({
      next: value => {
        this.client = value;
        this.deadline = this.client.deadline;
        this.buildForm();
      },
      error: err => console.error(err.message)
    });
    this.subscriptions.push(clientSubs);
  }

  buildForm() {
    this.editGroupInvoiceForm = this.formBuilder.group({
      idClient: [this.client.corporateName],
      numberInvoice: [this.invoiceNumber, [referenceValidator(this.selectedDate)]],
      createdAt: [new Date(), [Validators.required, Validators.minLength(6)]],
      travelFees: ['', [Validators.required]],
      addDeadline: [true],
    });

    // Calcule la TVA sur le montant HT
    this.tva = this.amount * 0.2;

    // Abonnement aux modifications des frais de déplacement
    const travelExpensesSubscription = this.editGroupInvoiceForm.get('travelFees')?.valueChanges.subscribe((travelFees) => {
      this.travelF = this.editGroupInvoiceForm.get('travelFees')?.value;
      // Calcule le montant TTC en ajoutant la TVA et les frais de déplacement
      this.ttc = this.tva + this.travelF + this.amount;
    });

    if (travelExpensesSubscription) {
      this.subscriptions.push(travelExpensesSubscription);
    }
  }

  updateInvoiceNumber() {
    const year = this.selectedDate.getFullYear() % 100; // Récupère les deux derniers chiffres de l'année
    const month = this.selectedDate.getMonth() + 1; // Les mois commencent à 0 en JS

    this.invoicingService.getNextInvoiceNumber(year, month).subscribe((nextNum: string) => {
      this.invoiceNumber = nextNum;
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.value;
    this.updateInvoiceNumber();
  }

  getUserProfile() {
    if (this.keycloakService.isLoggedIn()) {
      this.keycloakService.loadUserProfile().then(profile => {
        this.userProfile = profile;
      });
    }
  }

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
      createdAt: this.editGroupInvoiceForm.get('createdAt')?.value,
      addDeadline : this.editGroupInvoiceForm.get('addDeadline')?.value,
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
