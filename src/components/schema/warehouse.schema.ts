import z from "zod";

export const warehouseSchema = z.object({
  name: z
    .string("Name must be a string")
    .nonempty("Name is required")
    .min(2, "Name must be at least 2 characters"),
  location: z.string().min(2).nullable(),
  contactPhone: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number (e.g. 0912345678 or +251912345678 0712345678 or +251712345678)",
    )
    .nonempty("Phone number is required"),
  description: z.string().optional(),
  isInternal: z.boolean().nullish(),
});

// Schema for array of warehouses (bulk creation)
export const warehousesArraySchema = z.object({
  warehouses: z
    .array(warehouseSchema)
    .min(1, "At least one warehouse is required"),
});

export type FormWarehouseValues = z.infer<typeof warehouseSchema>;
export type FormWarehousesArrayValues = z.infer<typeof warehousesArraySchema>;
