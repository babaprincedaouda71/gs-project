import {Injectable} from '@angular/core';
import {GroupInvoiceModel, GroupModel, TrainingModel} from "../../models/training.model";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  // private host : string = "http://57.128.221.44:8888/TRAINING-SERVICE"
  // private host: string = "http://51.254.114.223:8888/TRAINING-SERVICE"
  private host: string = "http://127.17.0.1:8888/TRAINING-SERVICE"

  constructor(private http: HttpClient) {
  }

  public getGroups() {
    return this.http.get<Array<GroupModel>>(`${this.host}/trainingGroup/all`)
  }

  // public updateLifeCycle(idGroup: number, group: GroupModel) {
  //   return this.http.put<GroupModel>(`${this.host}/trainingGroup/updateLifeCycle/${idGroup}`, group)
  // }

  // Pas encore implémentée
  public addPv(pv: string, idGroup: number) {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/add/pv/${idGroup}`, pv)
  }

  public removePv(idGroup: number, group: GroupModel) {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/remove/pv/${idGroup}`, group)
  }

  public addTrainingSupport(formData: FormData, idTraining: number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/add/trainingSupport/${idTraining}`, formData, {headers})
  }

  public removeTrainingSupport(idTraining: number, group: GroupModel) {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/remove/trainingSupport/${idTraining}`, group)
  }

  public addReferenceCertificate(formData: FormData, idTraining: number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/add/referenceCertificate/${idTraining}`, formData, {headers})
  }

  public removeReferenceCertificate(idTraining: number, group: GroupModel) {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/remove/referenceCertificate/${idTraining}`, group)
  }

  public addTrainingNotes(trainingNotes: FormData, idTraining: number) {
    const headers = new HttpHeaders()
    headers.append('Content-Type', 'multipart/form-data')
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/add/trainingNotes/${idTraining}`, trainingNotes, {headers})
  }

  public removeTrainingNotes(idTraining: number, group: GroupModel) {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/remove/trainingNotes/${idTraining}`, group)
  }

  public getGroupsToBeInvoiced() {
    return this.http.get<Array<GroupInvoiceModel>>(`${this.host}/trainingGroup/find/groupsToBeInvoiced`)
  }

  public getGroupsByIds(groupIds: Array<number>) {
    return this.http.post<Array<GroupInvoiceModel>>(`${this.host}/trainingGroup/find/groupsByIds`, groupIds)
  }

  public getGroup(idGroup: number) {
    return this.http.get<GroupModel>(`${this.host}/trainingGroup/find/${idGroup}`)
  }

  public updateLifeCycle(groupId: number, group: GroupModel): Observable<GroupModel> {
    return this.http.put<GroupModel>(`${this.host}/${groupId}/lifecycle`, group);
  }

  public checkIfPvExists(trainingId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.host}/training/${trainingId}/pv/exists`);
  }

  public updateGroupStatus(groupId: number, newStatus: string): Observable<any> {
    return this.http.put<GroupModel>(`${this.host}/trainingGroup/${groupId}/status`, {status: newStatus});
  }

  public updateGroupsStatus(groupIds: Array<number> | undefined): Observable<any> {
    return this.http.put(`${this.host}/trainingGroup/groups/status`, groupIds);
  }


  /************************* Useful methods *************************/
  calculateGroupAmount(training: TrainingModel) {
    let workingDays: number = 0;
    training.groups.forEach(group => {
      if (group.startDate && group.endDate) {
        const startDate = new Date(group.startDate);
        const endDate = new Date(group.endDate);
        const diffInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        for (let i = 0; i <= diffInDays; i++) {
          const currentDay = new Date(startDate.getTime() + i * (1000 * 3600 * 24));
          const dayOfWeek = currentDay.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
          }
        }
        group.groupAmount = workingDays * training.dailyAmount
      } else {
        group.groupAmount = group.groupDates.length * training.dailyAmount
      }
    })
  }
}
