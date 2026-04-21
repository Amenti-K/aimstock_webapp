import { z } from "zod";

export const saleItemSchema = z.object({
  unitPrice: z.coerce.number().refine((n) => !Number.isNaN(n), {
    message: "Unit price must be a number",
  }),
  quantity: z.coerce.number().refine((n) => !Number.isNaN(n), {
    message: "Quantity must be a number",
  }),
  inventoryId: z.string().min(1, { message: "Inventory is required" }),
  warehouseId: z.string().optional(),
});

export const paymentItemSchema = z.object({
  amount: z.coerce.number().refine((n) => !Number.isNaN(n), {
    message: "Amount must be a number",
  }),
  accountId: z.string().min(1, { message: "Account is required" }),
});

export const cashPaymentSchema = z.object({
  amount: z.coerce.number().refine((n) => !Number.isNaN(n), {
    message: "Amount must be a number",
  }),
});

export const saleSchema = z.object({
  partnerId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),

  saleItems: z
    .array(saleItemSchema)
    .min(1, { message: "Items must contain at least one item" }),
  // paymentItems: z
  //     .array(paymentItemSchema)
  //     .min(1, { message: "payments must contain at least one payment" }),
  salePayments: z.array(paymentItemSchema).optional(),

  saleCashPayment: cashPaymentSchema.optional(),
});

export type SaleFormValues = z.infer<typeof saleSchema>;
