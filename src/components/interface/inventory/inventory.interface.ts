import { ILastAudit } from "../auditLog/interface.audit";
import { IPurchaseItem } from "../purchase/purchase.interface";
import { ISellItem } from "../sales/interface.sale";
import { IWarehouse } from "../warehouse/warehouse.interface";

export enum StockStatus {
  ALL = "all",
  LOW = "low",
  OUT = "out",
}

export enum TimeFrame {
  LAST_30_DAYS = "LAST_30_DAYS",
  LAST_90_DAYS = "LAST_90_DAYS",
  LAST_180_DAYS = "LAST_180_DAYS",
  LAST_365_DAYS = "LAST_365_DAYS",
}

export interface IInventoryFilters {
  search?: string;
  stockStatus?: StockStatus;
}

export interface INewInventory {
  sku: string;
  name: string;
  boughtPrice: number;
  sellingPrice: number;
  brand?: string;
  unit?: string;
  initialQuantity: number;
}

export interface INewInventoryWarehouseQuantity {
  quantity: number;
  reorderQuantity: number;
  inventoryId: string;
  warehouseId: string;
  warehouseInventories: INewInventory[];
}

export interface IWarehouseInventory {
  id: string;
  quantity: number;
  reorderQuantity: number;
  inventoryId: string;
  warehouseId: string;
  warehouse: IWarehouse;
}

export interface IInventory {
  id: string;
  sku: string;
  name: string;
  boughtPrice: number;
  sellingPrice: number;
  brand?: string;
  unit?: string;
  initialQuantity: number;
  warehouseInventories: IWarehouseInventory[];
  hasTransactions: boolean;
}

export interface IInventoryDetail extends IInventory {
  purchaseItems: IPurchaseItem[];
  saleItems: ISellItem[];
  warehouseInventories: {
    id: string;
    quantity: number;
    reorderQuantity: number;
    inventoryId: string;
    warehouseId: string;
    warehouse: IWarehouse;
  }[];
  lastAuditLog: ILastAudit;
}

export interface IInventoryFormProps {
  selectedInventoryId?: string | undefined;
  onEdit?: (value: any) => void;
  item?: IInventory | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface IQuickInventoryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface IQuickInventory {
  sku: string;
  name: string;
  boughtPrice: number;
  sellingPrice: number;
  brand?: string;
  unit?: string;
}

export interface IWarehouseInventorySelector {
  id: string;
  inventoryId: string;
  warehouseId: string;
  quantity: string;
  warehouse: {
    name: string;
    isInternal: boolean;
  };
}

export interface IInventorySelector {
  id: string;
  name: string;
  boughtPrice: number;
  sellingPrice: number;
  warehouseInventories: IWarehouseInventorySelector[];
}

export interface IInventorySelectorResponse {
  data: IInventorySelector[];
}

export interface ISelectorWarehouseInventory {
  id: string;
  quantity: string | number;
  inventory: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface ISelectorWarehouseInventoryResponse {
  data: ISelectorWarehouseInventory[];
}

export interface IInventoryReport {
  totalMoneyInventory: number;
  totalItems: number;
}

export interface IInventoryAnalyticsAggregateTranx extends IPurchaseItem {
  type: "purchase" | "sale";
  createdAt: Date;
  purchaseId?: string;
  saleId?: string;
}

export interface IInventoryAnalytics {
  summary: {
    totalPurchase: number;
    totalSale: number;
    netMovement: number;
    avgDailySales: number;
  };
  financials: {
    totalRevenue: number;
    totalCOGS: number;
    totalProfit: number;
    profitMargin: number;
    avgPurchasePrice: number;
    avgSalePrice: number;
  };
  analysis: {
    topPerformingWarehouses: {
      name: string;
      totalSold: number;
      revenue: number;
    }[];
  };
  history: IInventoryAnalyticsAggregateTranx[];
}
