import z from "zod";

const expensePaymentSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.number().positive("Amount must be positive"),
});

const expenseCashPaymentSchema = z.object({
  amount: z.number().min(0, "Amount must be positive"),
});

export const expenseSchema = z
  .object({
    description: z.string().optional(),
    paymentItems: z.array(expensePaymentSchema),
    cashItem: expenseCashPaymentSchema.optional(),
  })
  .refine(
    (data) => {
      // Calculate total from all payment sources
      const bankTotal = Array.isArray(data.paymentItems)
        ? data.paymentItems.reduce((sum, item) => sum + (item.amount || 0), 0)
        : 0;
      const cashTotal = data.cashItem?.amount || 0;
      const total = bankTotal + cashTotal;

      // Must have at least some payment
      return total > 0;
    },
    {
      message:
        "Total expense amount must be greater than 0. Please add at least one payment.",
      path: ["paymentItems"],
    },
  );

export type FormExpenseValues = z.infer<typeof expenseSchema>;
