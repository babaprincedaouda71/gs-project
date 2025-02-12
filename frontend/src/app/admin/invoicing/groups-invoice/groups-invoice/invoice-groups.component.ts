import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupService} from "../../../../_services/group.service";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";
import {GroupInvoiceModel} from "../../../../../models/training.model";
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-invoice-groups',
  templateUrl: './invoice-groups.component.html',
  styleUrl: './invoice-groups.component.scss'
})
export class InvoiceGroupsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'client',
    'theme',
    'group',
    'staff',
    'amount',
    'select'
  ];
  datasource!: MatTableDataSource<GroupInvoiceModel>;
  selection = new SelectionModel<GroupInvoiceModel>(true, []);
  client!: string;
  theme!: string;
  private subscriptions: Subscription[] = [];

  constructor(private groupService: GroupService,
              private snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {
    this.getGroups()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  getGroups() {
    const groupsSubscription = this.groupService.getGroupsToBeInvoiced().subscribe({
      next: data => {
        this.datasource = new MatTableDataSource(data)
      },
      error: err => {
        console.log(err.message);
      }
    })
    this.subscriptions.push(groupsSubscription)
  }


  onGoToValidate() {
    // Extract group ids
    const selectedGroupIds = this.selection.selected.flatMap(group => {
      return group.idGroup
    })

    // Put it in Local storage
    localStorage.setItem('selectedGroupIds', JSON.stringify(selectedGroupIds));

    // Naviguer vers la page cible
    this.router.navigate(['/invoicing/edit-groups-invoice'])
  }

  /*********** Start Check *********************/
  /** Check if the group can be selected */
  canSelect(currentGroup: GroupInvoiceModel): boolean {
    // Si aucune sélection n'a été faite, permettre la sélection
    if (this.selection.isEmpty()) {
      return true;
    }

    // Récupère le premier groupe sélectionné
    const selectedGroup: GroupInvoiceModel = this.selection.selected[0];
    // Vérifie que le client est le même
    const sameClient = selectedGroup.client === currentGroup.client;

    // Extraction du mois de completion pour la vérification (désactivée pour l'instant)
    // const selectedMonth = new Date(selectedGroup.completionDate).getMonth();
    // const currentMonth = new Date(currentGroup.completionDate).getMonth();
    // const sameMonth = selectedMonth === currentMonth;

    // Pour l'instant, on ne vérifie que le client
    return sameClient;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): any {
    const numSelected = this.selection.selected.length;
    const numRows = this.datasource.data.length;
    return numSelected === numRows;
  }

  onRowClick(event: MouseEvent, row: GroupInvoiceModel): void {
    event.preventDefault();
    if (this.canSelect(row)) {
      this.selection.toggle(row);
    } else {
      this.snackBar.open('Les Groupes sélectionnés doivent avoir le même Client et le même mois de réalisation.', 'Fermer', {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: 'center'
      });
    }
  }

  onGroupCheckboxChange(event: any, group: GroupInvoiceModel): void {
    if (event.checked && !this.canSelect(group)) {
      event.preventDefault();
      this.snackBar.open('Les Groupes sélectionnés doivent avoir le même Client et le même mois de réalisation.', 'Fermer', {
        duration: 5000,
        verticalPosition: "top",
        horizontalPosition: 'center'
      });
      return;
    }
    this.selection.toggle(group);
  }

  /** The label for the checkbox on the passed group */
  checkboxLabel(group?: GroupInvoiceModel): string {
    if (!group) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(group) ? 'deselect' : 'select'} group ${group.idGroup}`;
  }

  /*********** End Check *********************/
}
