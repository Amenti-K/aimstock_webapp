import z from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  contactPhone: z
    .string()
    .regex(
      /^(09[0-9]{8}|07[0-9]{8}|\+2519[0-9]{8}|\+2517[0-9]{8})$/,
      "Phone number must be a valid Ethiopian number",
    ),
  description: z.string().optional(),
  isInternal: z.boolean().default(false).optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;
