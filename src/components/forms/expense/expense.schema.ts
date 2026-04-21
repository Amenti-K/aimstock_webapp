import z from "zod";

const expensePaymentSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.number().min(0, "Amount must be positive"),
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
  .refine((data) => {
    const bankTotal = data.paymentItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const cashTotal = data.cashItem?.amount || 0;
    return bankTotal + cashTotal > 0;
  }, "Total expense amount must be greater than 0");

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
