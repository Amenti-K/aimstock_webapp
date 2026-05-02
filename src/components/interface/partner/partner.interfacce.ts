import { ILastAudit } from "../auditLog/interface.audit";
import { IInventory } from "../inventory/inventory.interface";
import { ILoanTranx } from "../loan/loan.interface";
import { IPurchase } from "../purchase/purchase.interface";
import { ISale } from "../sales/interface.sale";

export interface IPartner {
  id: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface INewPartner {
  name: string;
  phone?: string;
  address?: string;
}

export interface IPartnerResponse {
  data: IPartner[];
}

export interface IPartnerFormProps {
  modalOpen?: boolean;
  closeModal?: () => void;
  selectedPartnerId?: string | undefined;
  onEdit?: (value: any) => void;
  item?: IPartner | null;
  onSuccess?: (partner: any) => void;
  isQuickAdd?: boolean;
}

export interface IPartnerSelector {
  id: string;
  name: string;
}

export interface IPartnerSelectorResponse {
  data: IPartnerSelector[];
}

export interface IPartnerDetail extends IPartner {
  loans: ILoanTranx[];
  sale: ISale[];
  purchases: IPurchase[];
  lastAuditLog: ILastAudit;
}

export interface IPurchasePartner {
  id: string;
  orderDate: string;
  receiveDate: string;
  description?: string;
  partnerId?: string;
  partner: IPartner;
  purchaseItems: {
    inventory: IInventory;
    unitPrice: number | string;
    quantity: number;
  }[];
  total?: number;
}

// export interface ISalePartner {
//   id: string;
//   orderDate: string;
//   receiveDate: string;
//   description?: string;
//   partnerId?: string;
//   partner: IPartner;
//   saleItems: {
//     inventory: IInventory;
//     unitPrice: number | string;
//     quantity: number;
//   }[];
//   total?: number;
// }
