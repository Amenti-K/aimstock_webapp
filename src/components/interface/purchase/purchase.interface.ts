import { ILastAudit } from "../auditLog/interface.audit";
import { IAccount } from "../interface.account";
import { IInventory } from "../inventory/inventory.interface";
import { ILoanTranx } from "../loan/loan.interface";
import {
  IPartner,
  IPartner as IPartnerView,
} from "../partner/partner.interfacce";
import { IWarehouse } from "../warehouse/warehouse.interface";

export interface IPurchaseItem {
  id: string;
  unitPrice: number;
  quantity: number;
  inventoryId: string;
  warehouseId?: string;
}

export interface IPaymentItem {
  amount: number;
  description?: string;
  accountId: string;
}

export interface IPurchaseCashPayment {
  amount: number;
  description?: string;
}

export interface INewPurchase {
  description?: string;
  partnerId: string;
  purchaseItems: IPurchaseItem[];
  paymentItems: IPaymentItem[];
  purchaseCashPayment?: IPurchaseCashPayment;
}

export interface IPurchaseInventory {
  name: string;
}

export interface IPurchase {
  id: string;
  createdAt: string;
  description?: string;
  partnerId?: string;
  partner: IPartner;
  purchaseItems: {
    inventory: IPurchaseInventory;
    unitPrice: number | string;
    quantity: number;
  }[];
  total: number;
}

export interface IPurchaseResponse {
  data: IPurchase[];
}

export interface IPurchaseDailyResponse {
  totalPaidByBank: number;
  totalPaidByCash: number;
  totalLoan: number;
}

export interface IPurchaseFormProps {
  selectedPurchaseId?: string | undefined;
  onEdit?: (value: any) => void;
  item?: IPurchase | null;
}

export interface IPurchaseView extends IPurchase {
  partner: IPartnerView;
  purchaseItems: PurchaseItem[];
  purchasePayments?: IPurchasePaymentItem[];
  purchaseCashPayment?: IPurchaseCashPayment;
  loan?: ILoanTranx;
  lastAuditLog: ILastAudit;
}

export interface PurchaseItem {
  id: string;
  unitPrice: number;
  quantity: number;
  createdAt: Date;
  inventory: IInventory;
  warehouse: IWarehouse;
}
export interface IPurchasePaymentItem {
  id: string;
  amount: number;
  description?: string;
  accountId: string;
  account: IAccount;
  createdAt: Date;
}
