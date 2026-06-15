import { z } from "zod";

// Same rationale as sale.schema.ts: z.number() keeps input typed, z.input<>
// for PurchaseFormValues aligns with zodResolver v5's type inference.
export const purchaseItemSchema = z.object({
  unitPrice: z
    .number({ error: "Unit price must be a number" })
    .min(0.0001, { message: "Unit price must be greater than 0" }),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .min(0.0001, { message: "Quantity must be greater than 0" }),
  inventoryId: z.string().min(1, { message: "Inventory is required" }),
  warehouseId: z.string().optional().nullable(),
});

export const purchasePaymentItemSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .min(1, { message: "Amount must be at least 1" }),
  accountId: z.string().min(1, { message: "Account is required" }),
});

export const purchaseCashPaymentSchema = z.object({
  amount: z.number().min(0).default(0),
});

export const purchaseSchema = z
  .object({
    partnerId: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    purchaseItems: z
      .array(purchaseItemSchema)
      .min(1, { message: "At least one item is required" }),
    purchasePayments: z.array(purchasePaymentItemSchema).default([]),
    purchaseCashPayment: purchaseCashPaymentSchema.default({ amount: 0 }),
  })
  .refine(
    (data) => {
      const totalPaid =
        data.purchasePayments.reduce((sum, p) => sum + p.amount, 0) +
        (data.purchaseCashPayment?.amount ?? 0);
      const grandTotal = data.purchaseItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      if (grandTotal > totalPaid && !data.partnerId) return false;
      return true;
    },
    {
      message: "Supplier is required for credit purchases",
      path: ["partnerId"],
    },
  )
  .refine(
    (data) => {
      const totalPaid =
        data.purchasePayments.reduce((sum, p) => sum + p.amount, 0) +
        (data.purchaseCashPayment?.amount ?? 0);
      const grandTotal = data.purchaseItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      return totalPaid <= grandTotal + 0.01;
    },
    {
      message: "Total payments cannot exceed the grand total",
      path: ["purchaseCashPayment", "amount"],
    },
  );

export type PurchaseFormValues = z.input<typeof purchaseSchema>;
