import { z } from "zod";

export const PermissionEnum = z.enum([
  "ALL",
  "CREATE",
  "VIEW",
  "DELETE",
  "UPDATE",
]);

export const ModuleEnum = z.enum([
  "AUTH",
  "ACCOUNT",
  "ANALYTICS",
  "AUDITLOG",
  "EMPLOYEES",
  "EXPENSE",
  "PARTNERS",
  "LOANS",
  "INVENTORY",
  "INVENTORYADJUSTMENT",
  "PURCHASE",
  "PAYMENT",
  "RECEIVE",
  "SALES",
  "WAREHOUSES",
  "RECEIPT",
  "ROLE",
  "SETTINGS",
  "COMPANY",
  "REPORTS",
  "SHIPMENTS",
  "PROFILE",
]);

export type Permission = z.infer<typeof PermissionEnum>;
export type Module = z.infer<typeof ModuleEnum>;

export interface IPermission {
  module: Module;
  permission: Permission;
}
