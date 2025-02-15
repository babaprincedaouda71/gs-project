import {Injectable} from '@angular/core';
import {TrainingModel} from "../../models/training.model";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private host : string = "http://192.168.1.12:8888/TRAINING-SERVICE"

  constructor(private http : HttpClient) { }

  public addTraining(training : TrainingModel) {
    return this.http.post<TrainingModel>(`${this.host}/training/add`, training)
  }

  public getTrainings() {
    return this.http.get<Array<TrainingModel>>(`${this.host}/training/all`)
  }

  public getTrainingsClient() {
    return this.http.get<Array<TrainingModel>>(`${this.host}/training/find/trainings-client`)
  }

  public getTrainingsByClient(idClient : number) {
    return this.http.get<Array<TrainingModel>>(`${this.host}/training/find/trainingsByClient/${idClient}`)
  }

  public getTraining(idTraining : number) {
    return this.http.get<TrainingModel>(`${this.host}/training/find/${idTraining}`)
  }

  public updateTraining(training : TrainingModel, idTraining : number) {
    return this.http.put<TrainingModel>(`${this.host}/training/update/${idTraining}`, training)
  }

  public updateLifeCycle(idTraining : number, training : TrainingModel) {
    return this.http.put<TrainingModel>(`${this.host}/training/updateLifeCycle/${idTraining}`, training)
  }

  public addPv(pv : string, idTraining : number) {
    return this.http.put<TrainingModel>(`${this.host}/training/add/pv/${idTraining}`, pv)
  }

  public removePv(idTraining : number, training : TrainingModel) {
    return this.http.put<TrainingModel>(`${this.host}/training/remove/pv/${idTraining}`, training)
  }

  public addTrainingSupport(formData: FormData, idTraining : number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<TrainingModel>(`${this.host}/training/add/trainingSupport/${idTraining}`, formData, { headers })
  }

  public removeTrainingSupport(idTraining: number, training: TrainingModel) {
    return this.http.put<TrainingModel>(`${this.host}/training/remove/trainingSupport/${idTraining}`, training)
  }

  public addReferenceCertificate(formData: FormData, idTraining : number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<TrainingModel>(`${this.host}/training/add/referenceCertificate/${idTraining}`, formData, { headers })
  }

  public removeReferenceCertificate(idTraining: number, training: TrainingModel) {
    return this.http.put<TrainingModel>(`${this.host}/training/remove/referenceCertificate/${idTraining}`, training)
  }

  public addTrainingNotes(trainingNotes: FormData, idTraining : number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<TrainingModel>(`${this.host}/training/add/trainingNotes/${idTraining}`, trainingNotes, { headers })
  }

  public removeTrainingNotes(idTraining: number, training: TrainingModel) {
    return this.http.put<TrainingModel>(`${this.host}/training/remove/trainingNotes/${idTraining}`, training)
  }

  public deleteTraining(idTraining : number) {
    return this.http.delete(`${this.host}/training/delete/${idTraining}`)
  }

  public sendMail(emailData : any){
    return this.http.post<string>(`${this.host}/mail/send`, emailData, {responseType : 'text' as 'json'})
  }

  public hasPV(idTraining: number) : Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/training/checkPv/${idTraining}`)
  }

  public hasTrainingSupport(idTraining: number) : Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/training/checkTrainingSupport/${idTraining}`)
  }

  public getFilteredTrainings(groupIds : Array<number>) {
    return this.http.post<Array<TrainingModel>>(`${this.host}/training/filteredByGroup`, groupIds )
  }
}
