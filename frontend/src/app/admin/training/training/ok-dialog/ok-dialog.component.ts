import {Component, Inject, Optional} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-ok-dialog',
  templateUrl: './ok-dialog.component.html'
})
export class OkDialogComponent {
  local_data : any
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any,) {
    this.local_data = {...data.obj}
  }
}
