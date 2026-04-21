import { ILastAudit } from "../auditLog/interface.audit";

export interface INewWarehouse {
  name: string;
  description?: string;
  isInternal: boolean;
  location: string;
  contactPhone: string;
}
export interface IWarehouse {
  id: string;
  name: string;
  description?: string;
  isInternal: boolean;
  location: string;
  contactPhone: string;
  lastAuditLog?: ILastAudit;
}

export interface IWarehouseResponse {
  data: IWarehouse[];
}

export interface IWarehouseFormProps {
  selectedWarehouseId?: string | undefined;
  onEdit?: (value: any) => void;
  item?: IWarehouse | null;
}

export interface IWarehouseSelect {
  id: string;
  name: string;
  isInternal: boolean;
}

export interface IWarehouseSelectResponse {
  data: IWarehouseSelect[];
}

export interface IWarehouseDetail {
  id: string;
  name: string;
  description?: string;
  isInternal: boolean;
  location: string;
  contactPhone: string;

  warehouseInventories: IWarehouseInventoryDetail[];
  purchaseItems: IWarehouseTransactions[];
  saleItems: IWarehouseTransactions[];
  lastAuditLog: ILastAudit;
}

export interface IWarehouseInventoryDetail {
  id: string;
  quantity: number;
  reorderQuantity: number;
  inventory: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
}

export interface IWarehouseTransactions {
  id: string;
  createdAt: Date;
}
