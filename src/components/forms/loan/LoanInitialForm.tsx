"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";

import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";

import { loanInitialSchema, InitialLoanData } from "@/components/schema/loan.schema";
import { useCreateLoanTranx } from "@/api/loan/api.loan";
import { LoanTxType } from "@/components/interface/loan/loan.interface";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { useFetchPartnerSelector } from "@/api/partner/api.partner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatter";
import { useLanguage } from "@/hooks/language.hook";

const LoanInitialSummary = ({ control }: { control: any }) => {
  const { t } = useLanguage();
  const paymentItems = useWatch({
    control,
    name: "paymentItems",
  });
  const loanCashPayment = useWatch({
    control,
    name: "loanCashPayment",
  });

  const calculatedAmount = useMemo(() => {
    const cashTotal = loanCashPayment ? Number(loanCashPayment.amount) || 0 : 0;
    const bankTotal = (paymentItems || []).reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0,
    );
    return bankTotal + cashTotal;
  }, [loanCashPayment, paymentItems]);

  return (
    <div className="rounded-3xl bg-primary/5 border border-primary/10 p-6 md:p-8 space-y-6 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-1 md:mb-2">
            {t("loan.form.totalTranx")}
          </p>
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-primary tracking-tighter break-all">
            {formatCurrency(calculatedAmount)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-primary/10">
        <div className="bg-background/40 p-3 rounded-2xl border border-primary/5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            {t("loan.form.bankPay.bankPayments")}
          </span>
          <span className="text-lg font-black text-foreground">
            {formatCurrency(
              calculatedAmount - (Number(loanCashPayment?.amount) || 0),
            )}
          </span>
        </div>
        <div className="bg-background/40 p-3 rounded-2xl border border-primary/5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            {t("loan.form.cashPay.cashPayments")}
          </span>
          <span className="text-lg font-black text-foreground">
            {formatCurrency(Number(loanCashPayment?.amount || 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

interface Props {
  data?: Partial<InitialLoanData> | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "add" | "edit";
}

export default function LoanInitialForm({
  data,
  onSuccess,
  onCancel,
  mode = "add",
}: Props) {
  const { t } = useLanguage();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<InitialLoanData>({
    resolver: zodResolver(loanInitialSchema),
    defaultValues: {
      partnerId: "",
      txType: "" as LoanTxType,
      paymentItems: [],
      loanCashPayment: { amount: 0 },
      note: "",
      dueDate: "",
    },
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "paymentItems",
  });

  const createLoanTranx = useCreateLoanTranx();
  const { data: partnersData, isPending: loadingPartners } =
    useFetchPartnerSelector();
  const { data: accounts, isPending: loadingAccounts } =
    useFetchAccountSelector();

  const partnerOptions = useMemo(() => {
    if (!Array.isArray(partnersData?.data)) return [];
    return partnersData.data.map((p: any) => ({
      value: p.id,
      label: p.name,
    }));
  }, [partnersData]);

  const accountOptions = useMemo(() => {
    if (!Array.isArray(accounts?.data)) return [];
    return accounts.data.map((a: any) => ({
      value: a.id,
      label: `${a.name} (${a.bank ?? "Cash"})`,
    }));
  }, [accounts]);

  useEffect(() => {
    if (data) {
      reset(data as any);
    }
  }, [data, reset]);

  const handleSave = (formData: InitialLoanData) => {
    const payload = {
      partnerId: formData.partnerId,
      txType: formData.txType as any,
      paymentItems: formData.paymentItems.map((item) => ({
        accountId: item.accountId,
        amount: Number(item.amount),
      })),
      loanCashPayment:
        formData.loanCashPayment && Number(formData.loanCashPayment.amount) > 0
          ? {
              amount: Number(formData.loanCashPayment.amount),
            }
          : undefined,
      note: formData.note,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    };

    createLoanTranx.mutate(payload, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleSave)}
      className="space-y-6 w-full max-w-full overflow-x-hidden"
    >
      <div className="grid grid-cols-1 gap-6">
        <SelectField
          name="partnerId"
          control={control as any}
          label={t("loan.form.partner")}
          options={partnerOptions}
          placeholder={
            loadingPartners ? t("loan.pendingLoan") : t("loan.form.selectPar")
          }
        />

        <div className="pt-2">
          <h3 className="text-lg font-semibold text-primary mb-4">
            {t("loan.form.initialLoanTranx")}
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                name="txType"
                control={control as any}
                options={[
                  {
                    label: t("loan.form.loanGiven"),
                    value: LoanTxType.LOAN_GIVEN,
                  },
                  {
                    label: t("loan.form.loanTaken"),
                    value: LoanTxType.LOAN_TAKEN,
                  },
                ]}
                placeholder={t("loan.form.selectTranxType")}
                label={t("loan.form.tranxType")}
              />
              <TextField
                name="dueDate"
                control={control as any}
                type="date"
                label={t("loan.form.dueDate")}
              />
            </div>

            {/* Bank Payments Section */}
            <div className="mt-6 border border-border p-4 rounded-xl bg-card shadow-sm">
              <div className="flex flex-row items-center justify-between mb-4 gap-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("loan.form.bankPay.bankPayments")}
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPayment({ accountId: "", amount: 0 })}
                  className="gap-2 rounded-full h-8"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t("loan.form.bankPay.addBankPayment")}
                </Button>
              </div>

              <div className="space-y-3">
                {paymentFields?.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-2 rounded-2xl bg-muted/20 border border-muted-foreground/5 shadow-sm"
                  >
                    <div className="w-[10%] flex justify-center flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        onClick={() => removePayment(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="w-[40%] flex-shrink-0">
                      <NumericField
                        name={`paymentItems.${index}.amount`}
                        control={control as any}
                        placeholder={t("loan.form.amount")}
                      />
                    </div>

                    <div className="w-[50%] flex-shrink-0">
                      <SelectField
                        name={`paymentItems.${index}.accountId`}
                        control={control as any}
                        options={accountOptions}
                        placeholder={
                          loadingAccounts
                            ? t("common.loading")
                            : t("loan.form.bankPay.selectAccount")
                        }
                      />
                    </div>
                  </div>
                ))}

                {paymentFields.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-muted rounded-xl text-muted-foreground text-sm">
                    {t("common.formHints.noBankPayments")}
                  </div>
                )}
              </div>
            </div>

            {/* Cash Payment Section */}
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <h4 className="text-sm font-semibold mb-3">
                {t("loan.form.cashPay.cashPayments")}
              </h4>
              <NumericField
                name="loanCashPayment.amount"
                control={control as any}
                placeholder="0.00"
                label={t("loan.form.amount")}
              />
            </div>

            <TextField
              name="note"
              control={control as any}
              label={t("loan.form.note")}
              placeholder={t("loan.form.note")}
              multiLine
            />
          </div>
        </div>
      </div>

      <LoanInitialSummary control={control as any} />

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <div className="flex-1">
          <SubmitButton
            title={
              mode === "add" ? t("loan.form.addLoan") : t("common.saveChanges")
            }
            loading={createLoanTranx.isPending}
            className="w-full h-12 rounded-xl font-bold"
          />
        </div>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-xl font-semibold"
            disabled={createLoanTranx.isPending}
            onClick={onCancel}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
