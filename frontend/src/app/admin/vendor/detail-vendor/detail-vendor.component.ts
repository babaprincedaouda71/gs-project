import {Component, OnDestroy, OnInit} from '@angular/core';
import {Vendor} from "../../../../models/vendor.model";
import {VendorService} from "../../../_services/vendor.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-detail-vendor',
  templateUrl: './detail-vendor.component.html',
  styleUrl: './detail-vendor.component.scss'
})
export class DetailVendorComponent implements OnInit, OnDestroy {
  vendor!: Vendor
  idSupplier!: number
  private subscriptions: Subscription[] = []

  constructor(private vendorService: VendorService,
              private router: Router,
              private route: ActivatedRoute,) {
  }

  ngOnInit() {
    this.idSupplier = this.route.snapshot.params['idSupplier'];
    this.getVendor(this.idSupplier);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


  getVendor(idSupplier: number) {
    const vendorSubscription = this.vendorService.getVendor(idSupplier)
      .subscribe({
        next: data => {
          this.vendor = data;
        },
        error: error => {
          console.log(error);
        }
      })
    this.subscriptions.push(vendorSubscription)
  }

  handleEditVendor(idSupplier: number) {
    this.router.navigate(['vendor/edit/' + idSupplier]);
  }
}
