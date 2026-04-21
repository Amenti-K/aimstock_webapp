import { z } from "zod";

export const CreateWarehouseInventorySchema = z.object({
  quantity: z
    .number("quantity must be a number")
    .min(0, "quantity must be >= 0"),

  reorderQuantity: z
    .number("quantity must be a number")
    .min(0, "reorderQuantity must be >= 0"),

  warehouseId: z
    .string("warehouseId is required")
    .nonempty("warehouseId must be a string")
    .min(1, "warehouseId cannot be empty"),
});

export const inventorySchema = z
  .object({
    sku: z.string("sku must be a string").optional(),

    name: z
      .string("name must be a string")
      .nonempty("name is required")
      .min(1, "name cannot be empty"),

    boughtPrice: z
      .number("boughtPrice must be a number")
      .min(0, "boughtPrice must be >= 0"),

    sellingPrice: z
      .number("sellingPrice must be a number")
      .min(0, "sellingPrice must be >= 0"),

    brand: z.string("brand must be a string").optional(),

    unit: z.string("unit must be a string").min(1, "unit cannot be empty"),

    initialQuantity: z
      .number("initialQuantity must be a number")
      .min(0, "initialQuantity must be >= 0"),

    warehouseInventories: z
      .array(
        CreateWarehouseInventorySchema,
        "warehouseInventories must be an array",
      )
      .min(1, "warehouseInventories must contain at least one item"),
  })
  .refine(
    (data) => {
      // Calculate the sum of all warehouse quantities
      const totalWarehouseQuantity = data.warehouseInventories.reduce(
        (sum, warehouse) => sum + (warehouse.quantity || 0),
        0,
      );
      // Ensure it equals the initial quantity
      return totalWarehouseQuantity === data.initialQuantity;
    },
    {
      message:
        "The sum of warehouse quantities must equal the initial quantity",
      path: ["initialQuantity"], // This will show the error on the warehouse inventories field
    },
  );

// Schema for array of inventory items (bulk creation)
export const inventoriesArraySchema = z.object({
  inventories: z
    .array(inventorySchema)
    .min(1, "At least one product is required"),
});

export type inventoriesArrayFormValues = z.infer<typeof inventoriesArraySchema>;
export type inventoryFormValues = z.infer<typeof inventorySchema>;
export type warehouseInventoryFormValues = z.infer<
  typeof CreateWarehouseInventorySchema
>;
