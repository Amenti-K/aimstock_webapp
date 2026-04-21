"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";

import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";

import {
  LoanTransactionData,
  loanTransactionSchema,
} from "./loan.schema";
import {
  useCreateLoanTranx,
  useUpdateLoanTx,
} from "@/api/loan/api.loan";
import { LoanTxType, ILoanTranx } from "@/components/interface/loan/loan.interface";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { Button } from "@/components/ui/button";

const LoanSummary = ({ control }: { control: any }) => {
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
      0
    );
    return bankTotal + cashTotal;
  }, [loanCashPayment, paymentItems]);

  return (
    <div className="p-4 bg-muted/50 rounded-lg mt-2 mb-4 border border-border">
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
        Total Transaction Value
      </p>
      <p className="text-2xl font-bold text-foreground">
        Br {calculatedAmount.toLocaleString()}
      </p>
    </div>
  );
};

interface Props {
  data?: ILoanTranx | null;
  partnerId: string;
  mode?: "add" | "edit";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function LoanTransactionForm({
  data,
  mode = "add",
  partnerId,
  onSuccess,
  onCancel,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoanTransactionData>({
    resolver: zodResolver(loanTransactionSchema),
    defaultValues: {
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

  const addLoanTranx = useCreateLoanTranx();
  const updateLoanTranx = useUpdateLoanTx();
  const { data: accounts, isPending: loadingAccounts } = useFetchAccountSelector();

  const accountOptions = useMemo(() => {
    if (!Array.isArray(accounts?.data)) return [];
    return accounts.data.map((a: any) => ({
      value: a.id,
      label: `${a.name} (${a.bank ?? "Cash"}) ${a.balance} Br`,
    }));
  }, [accounts]);

  useEffect(() => {
    if (data) {
      reset({
        txType: data.txType,
        paymentItems:
          data.loanPayments?.map((p: any) => ({
            accountId: p.accountId,
            amount: Number(p.amount),
          })) || [],
        loanCashPayment: {
          amount: Number(data.loanCashPayment?.amount || 0),
        },
        note: data.note || "",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [data, reset]);

  const handleSave = (formData: LoanTransactionData) => {
    const payload = {
      partnerId: partnerId!,
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

    if (mode === "edit" && data?.id) {
      updateLoanTranx.mutate(
        { ...payload, id: data.id },
        {
          onSuccess: () => {
            reset();
            onSuccess?.();
          },
        }
      );
    } else {
      addLoanTranx.mutate(payload, {
        onSuccess: () => {
          reset();
          onSuccess?.();
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <SelectField
          name="txType"
          control={control}
          options={[
            { label: "Loan Given", value: LoanTxType.LOAN_GIVEN },
            { label: "Loan Taken", value: LoanTxType.LOAN_TAKEN },
            { label: "Payment Made", value: LoanTxType.LOAN_PAYMENT },
            { label: "Payment Received", value: LoanTxType.LOAN_RECEIPT },
          ]}
          placeholder="Select Transaction Type"
          label="Transaction Type"
        />

        {/* Bank Payments Section */}
        <div className="border border-border p-4 rounded-lg bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold">Bank Payments</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendPayment({ accountId: "", amount: 0 })}
              className="gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Add Bank Payment
            </Button>
          </div>

          <div className="space-y-3">
            {paymentFields?.map((field, index) => (
              <div key={field.id} className="flex items-end gap-3">
                <div className="flex-1">
                  <SelectField
                    name={`paymentItems.${index}.accountId`}
                    control={control}
                    options={accountOptions}
                    placeholder={loadingAccounts ? "Loading..." : "Select Account"}
                    label={`Account ${index + 1}`}
                  />
                </div>
                <div className="flex-1">
                  <NumericField
                    name={`paymentItems.${index}.amount`}
                    control={control}
                    placeholder="0"
                    label="Amount"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="mb-0.5"
                  onClick={() => removePayment(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Payment Section */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h4 className="text-sm font-semibold mb-3">Cash Payments</h4>
          <NumericField
            name="loanCashPayment.amount"
            control={control}
            placeholder="0"
            label="Amount"
          />
        </div>

        <LoanSummary control={control} />

        <TextField
          name="dueDate"
          control={control}
          type="date"
          label="Due Date"
        />

        <TextField
          name="note"
          control={control}
          placeholder="Additional notes"
          multiLine
          label="Note"
        />
      </div>

      <div className="flex gap-4 items-center">
        <SubmitButton
          title={mode === "add" ? "Create Transaction" : "Save Changes"}
          loading={addLoanTranx.isPending || updateLoanTranx.isPending}
        />

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={addLoanTranx.isPending || updateLoanTranx.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
