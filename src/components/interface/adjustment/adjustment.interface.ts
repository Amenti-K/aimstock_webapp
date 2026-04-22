import { ILastAudit } from "../auditLog/interface.audit";
import { IInventory } from "../inventory/inventory.interface";
import { IWarehouse } from "../warehouse/warehouse.interface";

export enum IAdjustmentType {
  stockIn = "STOCK_IN",
  stockOut = "STOCK_OUT",
  transfer = "TRANSFER",
}

export interface IAdjustmentCard {
  id: string;
  type: IAdjustmentType;
  note: string;
  warehouseId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
  warehouse: {
    name: string;
  };
}

export interface IAdjustment {
  id: string;
  type: IAdjustmentType;
  note: string;
  warehouseId: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  items: IAdjustmentItem[];
  warehouse: IWarehouse;
  lastAuditLog?: ILastAudit;
}

export interface IAdjustmentResponse {
  data: IAdjustment[];
}

export interface IAdjustmentItem {
  id: string;
  quantity: number;
  inventoryId: string;
  toWarehouseId?: string;
  adjustmentId: string;
  createdAt: string;
  updatedAt: string;
  inventory: IInventory;
  toWarehouse?: IWarehouse;
}

export interface INewAdjustmentItem {
  quantity: number;
  inventoryId: string;
  toWarehouseId?: string;
}

export interface INewAdjustment {
  type: IAdjustmentType;
  note?: string;
  warehouseId: string;
  items: INewAdjustmentItem[];
}

export interface IAdjustmentFormProps {
  selectedAdjustmentId?: string | undefined;
  onEdit?: (value: any) => void;
  item?: IAdjustment | null;
}
