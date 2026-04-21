import { z } from "zod";
import { IAdjustmentType } from "@/interface/interface/adjustment.interface";

export const adjustmentItemSchema = z.object({
  inventoryId: z.string().uuid({ message: "inventoryId must be a valid UUID" }),
  quantity: z.coerce
    .number()
    .int({ message: "quantity must be an integer" })
    .positive({ message: "quantity must be greater than 0" }),
  toWarehouseId: z
    .string()
    .uuid({ message: "toWarehouseId must be a valid UUID" })
    .optional()
    .nullable(),
});

export const adjustmentSchema = z
  .object({
    warehouseId: z
      .string()
      .uuid({ message: "Source warehouse is required" })
      .min(1, { message: "Source warehouse is required" }),
    type: z.nativeEnum(IAdjustmentType, {
      errorMap: () => ({ message: "Please select a valid adjustment type" }),
    }),
    note: z.string().optional(),
    items: z
      .array(adjustmentItemSchema)
      .min(1, { message: "Please add at least one item" })
      .max(100, { message: "Maximum 100 items allowed per adjustment" }),
  })
  .refine(
    (data) => {
      // If type is TRANSFER, all items must have a destination warehouse
      if (data.type === IAdjustmentType.transfer) {
        return data.items.every(
          (item) => !!item.toWarehouseId && item.toWarehouseId !== "",
        );
      }
      return true;
    },
    {
      path: ["items"],
      message: "Destination warehouse is required for all items in a transfer",
    },
  )
  .refine(
    (data) => {
      // If type is TRANSFER, toWarehouseId must not be the same as warehouseId
      if (data.type === IAdjustmentType.transfer) {
        return data.items.every(
          (item) => item.toWarehouseId !== data.warehouseId,
        );
      }
      return true;
    },
    {
      path: ["items"],
      message: "Destination warehouse cannot be the same as source warehouse",
    },
  )
  .refine(
    (data) => {
      // For Transfers, (inventoryId, toWarehouseId) pairs must be unique
      if (data.type === IAdjustmentType.transfer) {
        const seen = new Set();
        for (const item of data.items) {
          const key = `${item.inventoryId}-${item.toWarehouseId}`;
          if (seen.has(key)) return false;
          seen.add(key);
        }
      } else {
        // For STOCK_IN/STOCK_OUT, inventoryId must be unique
        const seen = new Set();
        for (const item of data.items) {
          if (seen.has(item.inventoryId)) return false;
          seen.add(item.inventoryId);
        }
      }
      return true;
    },
    {
      path: ["items"],
      message: "Duplicate items detected in the list",
    },
  );

export type AdjustmentItemSchema = z.infer<typeof adjustmentItemSchema>;
export type CreateAdjustment = z.infer<typeof adjustmentSchema>;
