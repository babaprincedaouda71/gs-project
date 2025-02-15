import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {TrainingRoutingModule} from './training-routing.module';
import {
  AppTrainingDialogContentComponent,
  TrainingComponent,
  TrainingLifecycleDialogContentComponent
} from './training/training.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {MatError, MatFormField, MatFormFieldModule, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput, MatInputModule} from "@angular/material/input";
import {TablerIconsModule} from "angular-tabler-icons";
import {AddTrainingComponent} from './add-training/add-training.component';
import {DetailTrainingComponent, TrainingLifecycleDialogComponent} from './detail-training/detail-training.component';
import {EditTrainingComponent} from './edit-training/edit-training.component';
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {MatTooltip} from "@angular/material/tooltip";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import {MatDivider} from "@angular/material/divider";
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatCheckbox, MatCheckboxModule} from "@angular/material/checkbox";
import {MatGridList, MatGridListModule, MatGridTile} from "@angular/material/grid-list";
import {OkDialogComponent} from "./training/ok-dialog/ok-dialog.component";
import {LifeCycleComponent} from './life-cycle/life-cycle.component';
import {MatChipListbox, MatChipOption} from "@angular/material/chips";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {
  GroupComponent,
  LifecycleDialogContentComponent,
  LifecycleDocumentsDialogComponent,
} from './group/group.component';
import {DetailGroupComponent} from "./groups/detail-group/detail-group.component";
import {MatPaginator} from "@angular/material/paginator";
import {ErrorDialogComponent} from "./group/error-dialog/error-dialog.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    TrainingComponent,
    AppTrainingDialogContentComponent,
    AddTrainingComponent,
    DetailTrainingComponent,
    EditTrainingComponent,
    TrainingLifecycleDialogContentComponent,
    LifecycleDialogContentComponent,
    LifecycleDocumentsDialogComponent,
    OkDialogComponent,
    LifeCycleComponent,
    TrainingLifecycleDialogComponent,
    GroupComponent,
    DetailGroupComponent,
    ErrorDialogComponent
  ],
  imports: [
    CommonModule,
    TrainingRoutingModule,
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatInput,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSuffix,
    MatTable,
    ReactiveFormsModule,
    TablerIconsModule,
    MatHeaderCellDef,
    MatCardHeader,
    MatError,
    MatLabel,
    MatOption,
    MatSelect,
    MatIconButton,
    MatTooltip,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatDivider,
    MatDialogActions,
    MatDialogTitle,
    MatCheckbox,
    MatCheckboxModule,
    MatGridTile,
    MatGridList,
    MatGridListModule,
    MatDialogClose,
    MatDialogContent,
    MatChipListbox,
    MatChipOption,
    MatCardTitle,
    MatSlideToggle,
    MatFormField,
    MatProgressSpinner,
    MatNoDataRow,
  ],
  providers: [
    MatDatepickerModule,
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'}, // Définit la locale française,
    DatePipe
  ],
  exports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormField,
  ]
})
export class TrainingModule {
}
