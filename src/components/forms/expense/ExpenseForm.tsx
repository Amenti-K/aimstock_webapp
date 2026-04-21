"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  Trash2,
  ReceiptText,
  Banknote,
  CreditCard,
  Calculator,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useFetchAccountSelector } from "@/api/account/api.account";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseFormValues, expenseSchema } from "./expense.schema";

interface Props {
  initialData?: Partial<ExpenseFormValues> | null;
  onSubmit: (values: ExpenseFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Save Expense",
}: Props) {
  const { control, handleSubmit, reset } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      paymentItems: [],
      cashItem: { amount: 0 },
    },
  });
  const { data: accounts } = useFetchAccountSelector();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "paymentItems",
  });
  const paymentItems = useWatch({ control, name: "paymentItems" }) ?? [];
  const cashAmount = useWatch({ control, name: "cashItem.amount" }) ?? 0;

  useEffect(() => {
    if (!initialData) return;
    reset({
      description: initialData.description ?? "",
      paymentItems: initialData.paymentItems ?? [],
      cashItem: initialData.cashItem ?? { amount: 0 },
    });
  }, [initialData, reset]);

  const accountOptions = useMemo(() => {
    if (!Array.isArray(accounts?.data)) return [];
    return accounts.data.map((item: any) => ({
      value: item.id,
      label: `${item.name} (${item.bank ?? "Bank"})`,
    }));
  }, [accounts]);

  const total =
    paymentItems.reduce((sum, item) => sum + Number(item?.amount || 0), 0) +
    Number(cashAmount || 0);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto space-y-8 pb-10"
    >
      {/* General Info Section */}
      <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            <CardTitle>Expense Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <TextAreaField
            name="description"
            control={control}
            label="Description (Optional)"
            placeholder="What was this expense for?"
          />
        </CardContent>
      </Card>

      {/* Payment Sections */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        {/* Cash Payment Section */}
        <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-600" />
              <CardTitle>Cash Payment</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <NumericField
              name="cashItem.amount"
              control={control}
              label="Amount Paid in Cash"
              placeholder="0.00"
            />
          </CardContent>
        </Card>

        {/* Bank Payments Section */}
        <Card className="border-none shadow-lg bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <CardTitle>Bank Payments</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ accountId: "", amount: 0 })}
              className="rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {fields.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-xl border-muted text-muted-foreground italic text-sm">
                No bank accounts added for this expense.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="relative group">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-end bg-muted/20 p-4 rounded-2xl border border-muted/30">
                      <div className="md:col-span-7">
                        <SelectField
                          name={`paymentItems.${index}.accountId`}
                          control={control}
                          label="Source Account"
                          options={accountOptions}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <NumericField
                          name={`paymentItems.${index}.amount`}
                          control={control}
                          label="Amount"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive active:scale-95 transition-all"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary & Submission */}
      <div className="space-y-6">
        <Card className="border-none bg-primary/5 dark:bg-primary/10 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Expense Amount
                  </p>
                  <p className="text-3xl font-black text-foreground">
                    ETB{" "}
                    {Number(total).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 px-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-xl text-base font-semibold order-2 sm:order-1"
              onClick={onCancel}
              disabled={isPending}
            >
              Discard Changes
            </Button>
          )}
          <div className="flex-1 order-1 sm:order-2">
            <SubmitButton
              title={submitLabel}
              loading={isPending}
              className="w-full h-12 rounded-xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
