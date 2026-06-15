"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
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
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import {
  Landmark,
  PlusCircle,
  Trash2,
  Wallet,
  FileText,
  Banknote,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";

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

  const { data: accountsData, isLoading: loadingAccounts } =
    useFetchAccountSelector();
  const accountOptions = useMemo(() => {
    const list = Array.isArray(accountsData)
      ? accountsData
      : Array.isArray(accountsData?.data)
        ? accountsData.data
        : [];

    return list.map((account: any) => ({
      label: `${account.name} (${account.bank}) (${formatCurrency(account.balance ?? 0)})`,
      value: String(account.id),
    }));
  }, [accountsData]);

  const form = useForm<SettlingFormData>({
    resolver: zodResolver(settlingSchema),
    defaultValues: {
      txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
      note: "",
      paymentItems: [],
      loanCashPayment: { amount: 0, description: "" },
    },
  });

  const { control, handleSubmit, reset } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentItems",
  });

  const watchBankPayments = useWatch({ control, name: "paymentItems" }) || [];
  const watchCash = useWatch({ control, name: "loanCashPayment" });

  const totalAmount = useMemo(() => {
    const bankTotal = watchBankPayments.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const cashTotal = Number(watchCash?.amount || 0);
    return bankTotal + cashTotal;
  }, [watchBankPayments, watchCash]);

  useEffect(() => {
    if (open) {
      reset({
        txType: isReceiving ? LoanTxType.LOAN_RECEIPT : LoanTxType.LOAN_PAYMENT,
        note: "",
        paymentItems: [{ accountId: "", amount: 0 }],
        loanCashPayment: { amount: 0, description: "" },
      });
    }
  }, [open, isReceiving, reset]);

  const onSubmit = (data: SettlingFormData) => {
    const payload = {
      partnerId,
      txType: data.txType,
      note: data.note,
      paymentItems: data.paymentItems
        .filter((item) => item.accountId && Number(item.amount) > 0)
        .map((item) => ({
          accountId: item.accountId,
          amount: Number(item.amount),
        })),
      loanCashPayment:
        data.loanCashPayment && Number(data.loanCashPayment.amount) > 0
          ? {
              amount: Number(data.loanCashPayment.amount),
              description: data.loanCashPayment.description || "",
            }
          : undefined,
    };

    addLoanTranx.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-10 rounded-[0.5rem] border-none shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight">
                {t("loan.card.settle")}
              </DialogTitle>
              <DialogDescription className="text-base font-medium text-primary/60">
                {partnerName}
              </DialogDescription>
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/[0.03] border border-primary/5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">
                  {t("loan.modal.outStandingBal")}
                </p>
                <p className="text-2xl font-black text-primary">
                  {formatCurrency(maxAmount)}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`rounded-lg px-3 py-1 border-none font-bold text-[10px] uppercase tracking-widest ${
                  isReceiving
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {isReceiving ? t("loan.modal.oweYou") : t("loan.modal.youOwe")}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Note */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> {t("loan.form.note")}
              </h3>
              <TextAreaField
                control={control as any}
                name="note"
                placeholder={t("loan.form.note")}
              />
            </div>

            {/* Cash Payment */}
            <div className="flex justify-between items-center gap-2 space-x-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <Banknote className="h-5 w-5" />
                {t("purchase.form.cashPay.title")}
              </div>
              <div className="w-[40%]">
                <NumericField
                  control={control as any}
                  name="loanCashPayment.amount"
                  placeholder={t("loan.form.amount")}
                />
              </div>
            </div>

            {/* Bank Payments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Landmark className="h-3.5 w-3.5" />{" "}
                  {t("loan.form.bankPay.bankPayments")}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-primary hover:bg-primary/5 rounded-lg gap-2 text-xs font-bold"
                  onClick={() => append({ accountId: "", amount: 0 })}
                >
                  <PlusCircle className="h-3.5 w-3.5" />{" "}
                  {t("loan.form.bankPay.addBankPayment")}
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex-1">
                      <SelectField
                        control={control as any}
                        name={`paymentItems.${index}.accountId`}
                        options={accountOptions}
                        placeholder={t("loan.form.bankPay.selectAccount", {
                          index: index + 1,
                        })}
                        disabled={loadingAccounts}
                      />
                    </div>
                    <div className="w-32 md:w-40">
                      <NumericField
                        control={control as any}
                        name={`paymentItems.${index}.amount`}
                        placeholder="0.00"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Actions */}
            <div className="pt-6 space-y-6">
              <div className="flex items-center justify-between border-t border-dashed pt-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {t("loan.form.totalTranx")}
                  </p>
                  <p className="text-3xl font-black text-primary tracking-tighter">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-none rounded-lg px-4 py-1 text-[10px] font-bold uppercase tracking-widest"
                >
                  {isReceiving
                    ? t("loan.modal.recivePay")
                    : t("loan.modal.makePay")}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 h-12 rounded-2xl font-bold border-muted-foreground/10"
                >
                  {t("common.cancel")}
                </Button>
                <SubmitButton
                  onClick={handleSubmit(onSubmit)}
                  title={
                    isReceiving
                      ? t("loan.modal.recivePay")
                      : t("loan.modal.makePay")
                  }
                  loading={addLoanTranx.isPending}
                  className="flex-[2] h-12 rounded-2xl font-black shadow-lg shadow-primary/10"
                />
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
