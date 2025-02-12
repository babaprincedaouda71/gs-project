import {ClientModel} from "./client.model";
import {GroupInvoiceModel, GroupModel, TrainingModel} from "./training.model";
import {ProductItem} from "./standardInvoice";

export interface InvoiceModel {
  idInvoice: number;
  numberInvoice: string;
  idClient: number;
  editor: string;
  createdAt: Date;
  client: ClientModel,
  idTraining: number;
  trainings: Array<TrainingModel>,
  groups: Array<GroupInvoiceModel>,
  groupsIds: Array<number>
  products: Array<ProductItem>,
  ht: number;
  tva: number;
  travelFees: number;
  ttc: number;
  status: string;
  deadline: number;
  expired: boolean
  paymentDate: string;
  paymentMethod: string;
  invoiceType: string;
  cheque?: string;
  copyRemise?: string
  addDeadline?: boolean;
}

export interface GroupInvoice {
  idInvoice?: number;
  numberInvoice?: string
  idClient: number | null;
  editor: string;
  createdAt?: string,
  ht?: number,
  tva?: number | null;
  ttc?: number | null;
  travelFees?: number | null;
  groupsIds?: Array<number>;
  addDeadline?: boolean;
}
