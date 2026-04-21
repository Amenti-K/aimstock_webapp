"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";

import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";

import {
  loanInitialSchema,
  InitialLoanData,
} from "./loan.schema";
import { useCreateLoanTranx } from "@/api/loan/api.loan";
import { LoanTxType } from "@/components/interface/loan/loan.interface";
import { useFetchAccountSelector } from "@/api/account/api.account";
import {
  useFetchPartnerSelector,
  useCreatePartner,
} from "@/api/partner/api.partner";
import { Button } from "@/components/ui/button";

const LoanInitialSummary = ({ control }: { control: any }) => {
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
      label: `${a.name} (${a.bank ?? "Cash"}) ${a.balance} Br`,
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
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <SelectField
          name="partnerId"
          control={control}
          label="Partner"
          options={partnerOptions}
          placeholder={
            loadingPartners ? "Loading partners..." : "Select Partner"
          }
        />

        <div className="pt-2">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Initial Loan Transaction
          </h3>

          <div className="space-y-4">
            <SelectField
              name="txType"
              control={control}
              options={[
                { label: "Loan Given", value: LoanTxType.LOAN_GIVEN },
                { label: "Loan Taken", value: LoanTxType.LOAN_TAKEN },
              ]}
              placeholder="Select Transaction Type"
              label="Transaction Type"
            />

            {/* Bank Payments Section */}
            <div className="mt-6 border border-border p-4 rounded-lg bg-card">
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
                        placeholder={
                          loadingAccounts ? "Loading..." : "Select Account"
                        }
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
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="text-sm font-semibold mb-3">Cash Payments</h4>
              <NumericField
                name="loanCashPayment.amount"
                control={control}
                placeholder="0"
                label="Amount"
              />
            </div>

            <TextField
              name="dueDate"
              control={control}
              type="date"
              label="Due Date"
            />

            <TextField
              name="note"
              control={control}
              label="Note"
              placeholder="Additional notes"
              multiLine
            />
          </div>
        </div>
      </div>

      <LoanInitialSummary control={control} />

      <div className="flex gap-4 items-center">
        <SubmitButton
          title={mode === "add" ? "Create Loan Partner" : "Save Changes"}
          loading={createLoanTranx.isPending}
        />
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={createLoanTranx.isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
