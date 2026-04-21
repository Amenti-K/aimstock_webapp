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

export const rolePermissionSchema = z.object({
  module: ModuleEnum,
  permission: PermissionEnum,
});

export const roleSchema = z.object({
  name: z
    .string()
    .min(1, { message: "name is required" })
    .refine((val) => val.toLowerCase() !== "owner", {
      message: "name cannot be 'OWNER' (case-insensitive)",
    }),
  permissions: z
    .array(rolePermissionSchema)
    .min(1, { message: "permissions must contain at least one item" }),
});

export type Permission = z.infer<typeof PermissionEnum>;
export type Module = z.infer<typeof ModuleEnum>;
export type RolePermission = z.infer<typeof rolePermissionSchema>;
export type CreateRole = z.infer<typeof roleSchema>;
