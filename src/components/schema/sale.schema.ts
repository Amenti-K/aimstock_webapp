import { z } from "zod";

// NumericField's onChange already calls Number(val), so field values reaching
// this schema are already numbers. z.number() keeps the Zod v4 input type as
// `number` (not `unknown`), which satisfies zodResolver's FieldValues constraint.
// Zod v4 uses `error` (not `invalid_type_error`) for custom type messages.
export const saleItemSchema = z.object({
  unitPrice: z
    .number({ error: "Unit price must be a number" })
    .min(0.0001, { message: "Unit price must be greater than 0" }),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .min(0.0001, { message: "Quantity must be greater than 0" }),
  inventoryId: z.string().min(1, { message: "Inventory is required" }),
  warehouseId: z.string().optional().nullable(),
});

export const paymentItemSchema = z.object({
  amount: z
    .number({ error: "Amount must be a number" })
    .min(1, { message: "Amount must be at least 1" }),
  accountId: z.string().min(1, { message: "Account is required" }),
});

export const cashPaymentSchema = z.object({
  amount: z.number().min(0).default(0),
});

export const saleSchema = z
  .object({
    partnerId: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    saleItems: z
      .array(saleItemSchema)
      .min(1, { message: "At least one item is required" }),
    salePayments: z.array(paymentItemSchema).default([]),
    saleCashPayment: cashPaymentSchema.default({ amount: 0 }),
  })
  .refine(
    (data) => {
      const totalPaid =
        data.salePayments.reduce((sum, p) => sum + p.amount, 0) +
        (data.saleCashPayment?.amount ?? 0);
      const grandTotal = data.saleItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      if (grandTotal > totalPaid && !data.partnerId) return false;
      return true;
    },
    {
      message: "Customer is required for credit sales",
      path: ["partnerId"],
    },
  )
  .refine(
    (data) => {
      const totalPaid =
        data.salePayments.reduce((sum, p) => sum + p.amount, 0) +
        (data.saleCashPayment?.amount ?? 0);
      const grandTotal = data.saleItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      return totalPaid <= grandTotal + 0.01;
    },
    {
      message: "Total payments cannot exceed the grand total",
      path: ["saleCashPayment", "amount"],
    },
  );

// Use z.input<> for the form type so it matches what zodResolver v5 infers.
// Fields with .default() become optional in the input, matching RHF's internal
// TFieldValues → zodResolver overload resolution.
export type SaleFormValues = z.input<typeof saleSchema>;
