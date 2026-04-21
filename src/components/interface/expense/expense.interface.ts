import { ILastAudit } from "../auditLog/interface.audit";

export interface IExpense {
  id: string;
  amount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpenseDetail extends IExpense {
  expensePayments: {
    id: string;
    accountId: string;
    amount: number;
    account: {
      id: string;
      name: string;
      bank: string;
    };
  }[];
  expenseCashPayment: {
    amount: number;
  };
  lastAuditLog: ILastAudit;
}

export interface INewExpensePayment {
  accountId: string;
  amount: number;
}

export interface INewExpenseCashPayment {
  amount: number;
}

export interface INewExpense {
  description?: string;
  paymentItems?: INewExpensePayment[];
  cashItem: INewExpenseCashPayment;
}

export interface IExpenseFormProps {
  selectedExpenseId?: string;
}
