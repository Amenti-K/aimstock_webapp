import { z } from "zod";

export const permissionEnum = z.enum([
  "ALL",
  "CREATE",
  "VIEW",
  "DELETE",
  "UPDATE",
]);

export const moduleEnum = z.enum([
  "ACCOUNT",
  "PARTNERS",
  "LOANS",
  "INVENTORY",
  "INVENTORYADJUSTMENT",
  "PURCHASE",
  "SALES",
  "WAREHOUSES",
  "EMPLOYEES",
  "ROLE",
]);

export const rolePermissionSchema = z.object({
  module: moduleEnum,
  permission: permissionEnum,
});

export const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  permissions: z
    .array(rolePermissionSchema)
    .min(1, "Select at least one permission"),
});

export type ModuleType = z.infer<typeof moduleEnum>;
export type PermissionType = z.infer<typeof permissionEnum>;
export type RoleFormValues = z.infer<typeof roleFormSchema>;
