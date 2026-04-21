import { IUser } from "../user/user.interface";

export interface ILastAudit {
  action: AuditAction;
  user: IUser;
  createdAt: string;
}

export interface IAudit extends ILastAudit {
  id: string;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, { from: any; to: any }>;
  userId: string;
  companyId: string;
  entity?: any; // The full state of the entity
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  RESTORE = "RESTORE",
}

export enum EntityType {
  ACCOUNT = "ACCOUNT",
  AUTH = "AUTH",
  COMPANY = "COMPANY",
  EMPLOYEE = "EMPLOYEE",
  EXPENSE = "EXPENSE",
  INVENTORY = "INVENTORY",
  INVENTORYADJUSTMENT = "INVENTORYADJUSTMENT",
  LOAN = "LOAN",
  PARTNER = "PARTNER",
  PURCHASE = "PURCHASE",
  ROLE = "ROLE",
  SALE = "SALE",
  WAREHOUSE = "WAREHOUSE",
  // PAYMENT
  // RECEIVE
  // SHIPMENTS
  // RECEIPT
  // REPORTS
  // PROFILE
  // SETTINGS
}
