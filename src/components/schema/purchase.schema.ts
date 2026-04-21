import { z } from "zod";

export const purchaseItemSchema = z.object({
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

export const createPurchaseSchema = z.object({
  partnerId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),

  purchaseItems: z
    .array(purchaseItemSchema)
    .nonempty({ message: "Purchase items must contain at least one item" }),

  paymentItems: z.array(paymentItemSchema).optional(),

  purchaseCashPayment: cashPaymentSchema.optional(),
});

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;
