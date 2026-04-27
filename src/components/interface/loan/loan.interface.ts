import { ILastAudit } from "../auditLog/interface.audit";
import { IAccount } from "../interface.account";

export enum LoanTxType {
  LOAN_GIVEN = "loan_given",
  LOAN_TAKEN = "loan_taken",
  LOAN_PAYMENT = "loan_payment",
  LOAN_RECEIPT = "loan_receipt",
  SALE_FINANCING = "sale_financing",
  PURCHASE_FINANCING = "purchase_financing",
  ADJUSTMENT = "adjustment",
}

export interface ILoanPartner {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  balance: number;
}

export interface ILoanPayment {
  id: string;
  amount: number;
  description: string;
  account?: IAccount;
  accountId: string;
}

export interface ILoanCashPayment {
  id: string;
  amount: number;
  description: string;
  account?: IAccount;
  accountId: string;
}

export interface ILoanTranx {
  id: string;
  partnerId: string;
  txType: LoanTxType;
  amount: number;
  note?: string;
  dueDate?: Date | null;
  createdAt?: string;

  loanPayments?: ILoanPayment[];
  loanCashPayment?: ILoanCashPayment;

  purchaseId?: string;
  saleId?: string;
  lastAuditLog?: ILastAudit;
}

export interface IPaymentItem {
  accountId: string;
  amount: number;
}

export interface ILoanCashPaymentInput {
  amount: number;
  description?: string;
}

export interface INewLoanTranx {
  partnerId: string;
  txType: LoanTxType;
  paymentItems?: IPaymentItem[];
  loanCashPayment?: ILoanCashPaymentInput;
  note?: string;
  dueDate?: Date | null;
}

export interface IUpdateLoanTranx extends Partial<INewLoanTranx> {
  id: string;
}
