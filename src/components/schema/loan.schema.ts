import { LoanTxType } from "@/interface/loan/loan.interface";
import { z } from "zod";

// Payment item schema (for bank/account payments)
const paymentItemSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  amount: z.number().positive("Amount must be positive"),
});

// Cash payment schema
const loanCashPaymentSchema = z.object({
  amount: z.number().min(0, "Amount cannot be negative"),
});

// Initial loan transaction schema (for partner selection and initial loan)
export const loanInitialSchema = z
  .object({
    partnerId: z.string().min(1, "Partner is required"),
    txType: z.enum(
      [
        LoanTxType.LOAN_GIVEN,
        LoanTxType.LOAN_TAKEN,
        LoanTxType.LOAN_PAYMENT,
        LoanTxType.LOAN_RECEIPT,
        LoanTxType.SALE_FINANCING,
        LoanTxType.PURCHASE_FINANCING,
        LoanTxType.ADJUSTMENT,
      ],
      {
        required_error: "Transaction type is required",
      },
    ),
    paymentItems: z.array(paymentItemSchema),
    loanCashPayment: loanCashPaymentSchema.optional(),
    note: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // Calculate total from all payment sources
      const bankTotal = data.paymentItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0,
      );
      const cashTotal = data.loanCashPayment?.amount || 0;
      const total = bankTotal + cashTotal;

      // Must have at least some payment
      return total > 0;
    },
    {
      message:
        "Total amount must be greater than 0. Please add at least one payment.",
      path: ["paymentItems"],
    },
  );

// Loan transaction schema (for adding transaction to existing partner)
export const loanTransactionSchema = z
  .object({
    txType: z.enum(
      [
        LoanTxType.LOAN_GIVEN,
        LoanTxType.LOAN_TAKEN,
        LoanTxType.LOAN_PAYMENT,
        LoanTxType.LOAN_RECEIPT,
        LoanTxType.SALE_FINANCING,
        LoanTxType.PURCHASE_FINANCING,
        LoanTxType.ADJUSTMENT,
      ],
      {
        required_error: "Transaction type is required",
      },
    ),
    paymentItems: z.array(paymentItemSchema),
    loanCashPayment: loanCashPaymentSchema.optional(),
    note: z.string().optional(),
    dueDate: z.string().optional(),
  })
  .refine(
    (data) => {
      // Calculate total from all payment sources
      const bankTotal = data.paymentItems.reduce(
        (sum, item) => sum + (item.amount || 0),
        0,
      );
      const cashTotal = data.loanCashPayment?.amount || 0;
      const total = bankTotal + cashTotal;

      // Must have at least some payment
      return total > 0;
    },
    {
      message:
        "Total amount must be greater than 0. Please add at least one payment.",
      path: ["paymentItems"],
    },
  );

export type InitialLoanData = z.infer<typeof loanInitialSchema>;
export type LoanTransactionData = z.infer<typeof loanTransactionSchema>;

// Export sub-schemas for form components
export type PaymentItemData = z.infer<typeof paymentItemSchema>;
export type LoanCashPaymentData = z.infer<typeof loanCashPaymentSchema>;
