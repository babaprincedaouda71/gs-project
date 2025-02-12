import {ClientModel} from "./client.model";
import {Vendor} from "./vendor.model";

export interface TrainingModel {
  idTraining: number;
  idClient: number;
  client: ClientModel;
  theme: string;
  totalNumberOfDays?: number;
  totalStaff?: number;
  trainingDates: Array<string>;
  dailyAmount : number;
  amount: number;
  idBill?: number;
  groups: Array<GroupModel>
  trainingSupport: Uint8Array | undefined;
  pv : string | undefined;
  completionDate : string
}

export interface GroupModel {
  idGroup: number;
  label: string;
  groupStaff: number;
  location: string;
  startDate : string;
  endDate : string;
  groupDates: Array<string>;
  numDays: number;
  groupAmount: number;
  idSupplier: number | null;
  supplier?: any;
  completionDate : string
  groupLifeCycle: LifecycleModel
  status: string;
  presenceList: Uint8Array | undefined;
  evaluation: Uint8Array | undefined;
  referenceCertificate: Uint8Array | undefined;
  idClient? : number;
  client? : ClientModel;
  theme?: string;
  idTraining?: number;
  pv?: string | undefined;
  trainingSupport?: Uint8Array | undefined;
}

export interface GroupInvoiceModel {
  idGroup: number;
  label: string;
  groupStaff: number;
  location: string;
  startDate : string;
  endDate : string;
  groupDates: Array<string>;
  numDays: number;
  groupAmount: number;
  completionDate : string
  status: string;
  idClient : number;
  client : string;
  clientDeadline : number | null;
  theme?: string;
}

export interface LifecycleModel {
  idLifecycle: number;
  trainerSearch: boolean;
  trainerValidation: boolean;
  kickOfMeeting: boolean;
  trainingSupport: boolean;
  impression: boolean;
  completion: boolean;
  certif: boolean;
  invoicing: boolean;
  payment: boolean;
  reference : boolean;
}

export interface TrainingDTO {
  idTraining: number;
  idClient: number;
  theme: string;
  trainingSupport: Uint8Array | undefined;
  pv : string | undefined;
}

export interface GroupDTO {
  idGroup: number;
  groupStaff: number;
  location: string;
  startDate : string;
  endDate : string;
  groupDates: Array<string>;
  idSupplier: number | null;
  supplier: Vendor;
  completionDate : string
  groupLifeCycle: LifecycleModel
  status: string;
  training: TrainingDTO;  // Contient uniquement les données filtrées
}
