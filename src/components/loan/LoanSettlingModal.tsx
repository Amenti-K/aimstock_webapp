"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { useCreateLoanTranx } from "@/api/loan/api.loan";
import { LoanTxType } from "@/components/interface/loan/loan.interface";
import {
  SettlingFormData,
  settlingSchema,
} from "@/components/schema/loan.schema";
import { useLanguage } from "@/hooks/language.hook";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import TextField from "@/components/forms/fields/TextField";
import SubmitButton from "@/components/forms/fields/SubmitButton";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  balance: number;
}

export function LoanSettlingModal({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  balance,
}: Props) {
  const { t } = useLanguage();
  const isReceiving = balance > 0;
  const maxAmount = Math.abs(balance);
  const addLoanTranx = useCreateLoanTranx();
  const { data: accountsRaw, isLoading: loadingAccounts } =
    useFetchAccountSelector();
  const accounts = accountsRaw?.data || [];

  const form = useForm<SettlingFormData>({
    resolver: zodResolver(settlingSchema),
    defaultValues: {
      txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
      accountId: "",
      amount: maxAmount,
      note: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
        accountId: "",
        amount: undefined as any,
        note: "",
      });
    }
  }, [open, isReceiving, form]);

  const onSubmit = (data: SettlingFormData) => {
    if (data.amount > maxAmount) {
      form.setError("amount", {
        message: `Amount cannot exceed balance of ${maxAmount.toLocaleString()}`,
      });
      return;
    }

    addLoanTranx.mutate(
      {
        partnerId,
        txType: data.txType,
        paymentItems: [{ accountId: data.accountId, amount: data.amount }],
        note: data.note,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Loan - {partnerName}</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Outstanding Balance:{" "}
            <span className="font-bold text-foreground">
              Br {maxAmount.toLocaleString()}
            </span>{" "}
            ({isReceiving ? "Owes You" : "You Owe"})
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <SelectField
              control={form.control as any}
              name="txType"
              label={t("loan.form.tranxType")}
              options={[
                {
                  value: LoanTxType.LOAN_RECEIPT,
                  label: t("loan.form.paymentReceived"),
                },
                {
                  value: LoanTxType.LOAN_PAYMENT,
                  label: t("loan.form.paymentMade"),
                },
              ]}
              disabled
            />

            <SelectField
              control={form.control as any}
              name="accountId"
              label={t("loan.form.bankPay.selectAccount")}
              options={accounts.map((acc: any) => ({
                value: acc.id,
                label: `${acc.name} (${acc.bank ?? "Cash"})`,
              }))}
              placeholder={t("loan.form.bankPay.selectAccount")}
              disabled={loadingAccounts}
            />

            <NumericField
              control={form.control as any}
              name="amount"
              label={t("loan.form.amount")}
              placeholder="0.00"
            />

            <TextField
              control={form.control as any}
              name="note"
              label={t("loan.form.note")}
              placeholder={t("loan.form.note")}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 rounded-xl sm:flex-1"
              >
                {t("common.cancel")}
              </Button>
              <SubmitButton
                title={t("loan.form.settleLoan")}
                loading={addLoanTranx.isPending}
                className="h-11 rounded-xl sm:flex-1"
              />
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
