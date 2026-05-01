import { IAdjustmentType } from "@/components/interface/adjustment/adjustment.interface";
import z from "zod";

export const adjustmentItemSchema = z.object({
  inventoryId: z.string().min(1, "Inventory is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
  toWarehouseId: z.string().optional(),
});

export const adjustmentSchema = z
  .object({
    warehouseId: z.string().min(1, "Source warehouse is required"),
    type: z.nativeEnum(IAdjustmentType),
    note: z.string().optional(),
    items: z.array(adjustmentItemSchema).min(1, "Please add at least one item"),
  })
  .refine(
    (value) =>
      value.type !== IAdjustmentType.transfer ||
      value.items.every(
        (item) =>
          !!item.toWarehouseId && item.toWarehouseId !== value.warehouseId,
      ),
    "Transfer items require destination warehouse different from source",
  );

export type AdjustmentFormValues = z.infer<typeof adjustmentSchema>;
