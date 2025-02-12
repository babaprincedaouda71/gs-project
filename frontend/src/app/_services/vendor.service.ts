import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Vendor} from "../../models/vendor.model";

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private host : string = "http://192.168.1.124:8888/VENDOR-SERVICE"

  constructor(private http : HttpClient) { }

  public getVendors() {
    return this.http.get<Array<Vendor>>(`${this.host}/vendor/find/all`)
  }

  public getVendor(idSupplier : number) {
    return this.http.get<Vendor>(`${this.host}/vendor/find/${idSupplier}`)
  }

  public addVendor(vendor : FormData) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.post<Vendor>(`${this.host}/vendor/add`, vendor, { headers })
  }

  public deleteVendor(idSupplier : number) {
    return this.http.delete<Vendor>(`${this.host}/vendor/delete/${idSupplier}`)
  }

  public updateVendor(vendor : Vendor) {
    return this.http.put<Vendor>(`${this.host}/vendor/update`, vendor)
  }
}
