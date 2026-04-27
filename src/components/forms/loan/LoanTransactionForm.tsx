"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  Trash2,
  Calendar,
  FileText,
  Wallet,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useFetchAccountSelector } from "@/api/account/api.account";
import {
  loanTransactionSchema,
  LoanTransactionData,
} from "@/components/schema/loan.schema";
import { useCreateLoanTranx, useUpdateLoanTx } from "@/api/loan/api.loan";
import {
  LoanTxType,
  ILoanTranx,
} from "@/components/interface/loan/loan.interface";
import { useLanguage } from "@/hooks/language.hook";
import { formatCurrency } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import TextField from "@/components/forms/fields/TextField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SubmitButton from "@/components/forms/fields/SubmitButton";

interface Props {
  initialValues?: Partial<LoanTransactionData> | null;
  txId?: string;
  partnerId?: string;
  onSuccess?: () => void;
}

export default function LoanTransactionForm({
  initialValues,
  txId,
  partnerId,
  onSuccess,
}: Props) {
  const { t } = useLanguage();
  const isEdit = !!txId;

  const form = useForm<LoanTransactionData>({
    resolver: zodResolver(loanTransactionSchema),
    defaultValues: {
      txType: "" as LoanTxType,
      paymentItems: [],
      loanCashPayment: { amount: 0 },
      note: "",
      dueDate: "",
    },
  });

  const { control, handleSubmit, reset, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentItems",
  });

  const createLoanTx = useCreateLoanTranx();
  const updateLoanTx = useUpdateLoanTx();
  const { data: accountsData, isLoading: loadingAccounts } =
    useFetchAccountSelector();

  const watchAmount = useWatch({ control, name: "paymentItems" }) || [];
  const watchCash = useWatch({ control, name: "loanCashPayment" });

  const totalAmount = useMemo(() => {
    const bankTotal = watchAmount.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const cashTotal = Number(watchCash?.amount || 0);
    return bankTotal + cashTotal;
  }, [watchAmount, watchCash]);

  useEffect(() => {
    if (initialValues) {
      // Map loanPayments from API to paymentItems for the form
      const mappedPaymentItems =
        (initialValues as any).loanPayments?.map((p: any) => ({
          accountId: p.accountId || p.account?.id || "",
          amount: Number(p.amount) || 0,
        })) || [];

      // Ensure txType matches enum case if necessary
      const txType = initialValues.txType as LoanTxType;

      reset({
        txType: txType,
        paymentItems: mappedPaymentItems,
        loanCashPayment: initialValues.loanCashPayment || { amount: 0 },
        note: initialValues.note || "",
        dueDate: initialValues.dueDate
          ? new Date(initialValues.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [initialValues, reset]);

  const onFormSubmit = (data: LoanTransactionData) => {
    const payload = {
      ...data,
      partnerId: partnerId || (initialValues as any)?.partnerId || "",
      paymentItems: data.paymentItems.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
      loanCashPayment: data.loanCashPayment
        ? { amount: Number(data.loanCashPayment.amount) }
        : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };

    if (isEdit) {
      updateLoanTx.mutate(
        { ...payload, id: txId },
        { onSuccess: () => onSuccess?.() },
      );
    } else {
      createLoanTx.mutate(payload, { onSuccess: () => onSuccess?.() });
    }
  };

  const txTypes = [
    { value: LoanTxType.LOAN_GIVEN, label: t("loan.form.loanGiven") },
    { value: LoanTxType.LOAN_TAKEN, label: t("loan.form.loanTaken") },
    { value: LoanTxType.LOAN_PAYMENT, label: t("loan.form.paymentMade") },
    { value: LoanTxType.LOAN_RECEIPT, label: t("loan.form.paymentReceived") },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectField
          control={control as any}
          name="txType"
          label={t("loan.form.tranxType")}
          options={txTypes}
          placeholder={t("loan.form.selectTranxType")}
        />

        <TextField
          control={control as any}
          name="dueDate"
          type="date"
          label={t("loan.form.dueDate")}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Landmark className="h-4 w-4" />{" "}
            {t("loan.form.bankPay.bankPayments")}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full h-9 border-primary/20 text-primary hover:bg-primary/5 gap-2"
            onClick={() => append({ accountId: "", amount: 0 })}
          >
            <PlusCircle className="h-4 w-4" />{" "}
            {t("loan.form.bankPay.addBankPayment")}
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-2 p-2 rounded-2xl bg-muted/20 border border-muted-foreground/5 shadow-sm"
            >
              <div className="w-[50%] flex-shrink-0">
                <SelectField
                  control={control as any}
                  name={`paymentItems.${index}.accountId`}
                  options={
                    accountsData?.data?.map((acc: any) => ({
                      value: acc.id,
                      label: `${acc.name} (${acc.bank})`,
                    })) || []
                  }
                  placeholder={t("loan.form.bankPay.selectAccount", {
                    index: index + 1,
                  })}
                />
              </div>

              <div className="w-[40%] flex-shrink-0">
                <NumericField
                  control={control as any}
                  name={`paymentItems.${index}.amount`}
                  placeholder={t("loan.form.amount")}
                />
              </div>

              <div className="w-[10%] flex justify-center flex-shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <div className="text-center py-10 rounded-3xl border-2 border-dashed border-muted bg-muted/5 flex flex-col items-center justify-center text-muted-foreground">
              <Landmark className="h-10 w-10 mb-2 opacity-10" />
              <p className="text-sm font-medium">
                {t("common.formHints.noBankPayments")}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <NumericField
            control={control as any}
            name="loanCashPayment.amount"
            label={t("loan.form.cashPay.cashPayments")}
            placeholder="0.00"
          />

          <TextAreaField
            control={control as any}
            name="note"
            label={t("loan.form.note")}
            placeholder={t("loan.form.note")}
          />
        </div>

        <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1 md:mb-2">
                {t("loan.form.totalTranx")}
              </p>
              <p className="text-3xl md:text-4xl lg:text-5xl font-black text-primary tracking-tighter break-all">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-full sm:w-auto justify-center py-2 px-6 rounded-xl bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider h-fit"
            >
              {isEdit ? t("loan.form.editTranx") : t("loan.form.createTranx")}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-primary/10">
            <div className="bg-background/40 p-3 rounded-2xl border border-primary/5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                {t("loan.form.bankPay.bankPayments")}
              </span>
              <span className="text-lg font-black text-foreground">
                {formatCurrency(totalAmount - Number(watchCash?.amount || 0))}
              </span>
            </div>
            <div className="bg-background/40 p-3 rounded-2xl border border-primary/5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                {t("loan.form.cashPay.cashPayments")}
              </span>
              <span className="text-lg font-black text-foreground">
                {formatCurrency(Number(watchCash?.amount || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <SubmitButton
          title={isEdit ? t("loan.form.editTranx") : t("loan.form.createTranx")}
          loading={createLoanTx.isPending || updateLoanTx.isPending}
          className="flex-1 h-12 md:h-14 rounded-2xl"
        />
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 md:h-14 rounded-2xl font-bold text-base md:text-lg border-muted-foreground/20 hover:bg-muted/5"
          onClick={() => window.history.back()}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </>
  );
}
