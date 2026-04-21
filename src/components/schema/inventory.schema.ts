import { z } from "zod";

export const CreateWarehouseInventorySchema = z.object({
  quantity: z
    .number({
      required_error: "quantity is required",
      invalid_type_error: "quantity must be a number",
    })
    .min(0, "quantity must be >= 0"),

  reorderQuantity: z
    .number({
      required_error: "reorderQuantity is required",
      invalid_type_error: "reorderQuantity must be a number",
    })
    .min(0, "reorderQuantity must be >= 0"),

  warehouseId: z
    .string({
      required_error: "warehouseId is required",
      invalid_type_error: "warehouseId must be a string",
    })
    .min(1, "warehouseId cannot be empty"),
});

export const inventorySchema = z
  .object({
    sku: z
      .string({
        invalid_type_error: "sku must be a string",
      })
      .optional(),

    name: z
      .string({
        required_error: "name is required",
        invalid_type_error: "name must be a string",
      })
      .min(1, "name cannot be empty"),

    boughtPrice: z
      .number({
        required_error: "boughtPrice is required",
        invalid_type_error: "boughtPrice must be a number",
      })
      .min(0, "boughtPrice must be >= 0"),

    sellingPrice: z
      .number({
        required_error: "sellingPrice is required",
        invalid_type_error: "sellingPrice must be a number",
      })
      .min(0, "sellingPrice must be >= 0"),

    brand: z
      .string({
        invalid_type_error: "brand must be a string",
      })
      .optional(),

    unit: z
      .string({
        required_error: "unit is required",
        invalid_type_error: "unit must be a string",
      })
      .min(1, "unit cannot be empty"),

    initialQuantity: z
      .number({
        required_error: "initialQuantity is required",
        invalid_type_error: "initialQuantity must be a number",
      })
      .min(0, "initialQuantity must be >= 0"),

    warehouseInventories: z
      .array(CreateWarehouseInventorySchema, {
        required_error: "warehouseInventories is required",
        invalid_type_error: "warehouseInventories must be an array",
      })
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

export const inventoryUpdateSchema = z.object({
  sku: z
    .string({
      invalid_type_error: "sku must be a string",
    })
    .optional(),

  name: z
    .string({
      required_error: "name is required",
      invalid_type_error: "name must be a string",
    })
    .min(1, "name cannot be empty"),

  boughtPrice: z
    .number({
      required_error: "boughtPrice is required",
      invalid_type_error: "boughtPrice must be a number",
    })
    .min(0, "boughtPrice must be >= 0"),

  sellingPrice: z
    .number({
      required_error: "sellingPrice is required",
      invalid_type_error: "sellingPrice must be a number",
    })
    .min(0, "sellingPrice must be >= 0"),

  brand: z
    .string({
      invalid_type_error: "brand must be a string",
    })
    .optional(),

  unit: z
    .string({
      required_error: "unit is required",
      invalid_type_error: "unit must be a string",
    })
    .min(1, "unit cannot be empty"),

  initialQuantity: z
    .number({
      required_error: "initialQuantity is required",
      invalid_type_error: "initialQuantity must be a number",
    })
    .min(0, "initialQuantity must be >= 0"),

  warehouseInventories: z
    .array(CreateWarehouseInventorySchema, {
      required_error: "warehouseInventories is required",
      invalid_type_error: "warehouseInventories must be an array",
    })
    .min(1, "warehouseInventories must contain at least one item"),
});

// Schema for array of inventory items (bulk creation)
export const inventoriesArraySchema = z.object({
  inventories: z
    .array(inventorySchema)
    .min(1, "At least one product is required"),
});

export type inventoriesArrayFormValues = z.infer<typeof inventoriesArraySchema>;
export type inventoryFormValues = z.infer<typeof inventorySchema>;
export type inventoryUpdateFormValues = z.infer<typeof inventoryUpdateSchema>;

export const QuickInventorySchema = z.object({
  sku: z
    .string({
      invalid_type_error: "sku must be a string",
    })
    .optional(),

  name: z
    .string({
      required_error: "name is required",
      invalid_type_error: "name must be a string",
    })
    .min(1, "name cannot be empty"),

  boughtPrice: z
    .number({
      required_error: "boughtPrice is required",
      invalid_type_error: "boughtPrice must be a number",
    })
    .min(0, "boughtPrice must be >= 0"),

  sellingPrice: z
    .number({
      required_error: "sellingPrice is required",
      invalid_type_error: "sellingPrice must be a number",
    })
    .min(0, "sellingPrice must be >= 0"),

  brand: z
    .string({
      invalid_type_error: "brand must be a string",
    })
    .optional(),

  unit: z
    .string({
      required_error: "unit is required",
      invalid_type_error: "unit must be a string",
    })
    .min(1, "unit cannot be empty"),
});

export type QuickInventoryFormValues = z.infer<typeof QuickInventorySchema>;
export type warehouseInventoryFormValues = z.infer<
  typeof CreateWarehouseInventorySchema
>;
