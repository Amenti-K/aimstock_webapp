import { z } from "zod";
import { EthiopianFinancialInstitution } from "@/components/interface/interface.account";

export const accountSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Account name is required"),
  bank: z.enum(EthiopianFinancialInstitution),
  branch: z.string().optional(),
  number: z.string().optional(),
  balance: z
    .number("Balance must be a number")
    .nonnegative("Balance cannot be negative"),
});

export const transferSchema = z.object({
  toAccountId: z.string().min(1, "Select an account"),
  amount: z
    .number("Amount must be a number")
    .positive("Amount must be greater than 0"),
});

export type TransferFormType = z.infer<typeof transferSchema>;
export type AccountFormData = z.infer<typeof accountSchema>;
