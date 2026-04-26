"use client";

import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Banknote,
  CreditCard,
  Receipt,
  Calculator,
  Building2,
} from "lucide-react";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { useFetchPartnerSelector } from "@/api/partner/api.partner";
import { useGetInventoriesInfinite } from "@/api/inventory/api.inventory";
import { useFetchAccountSelector } from "@/api/account/api.account";
import { formatCurrency } from "@/lib/formatter";
import { useLanguage } from "@/hooks/language.hook";
import {
  INewPurchase,
  IPurchaseView,
} from "../../interface/purchase/purchase.interface";

type PurchaseFormValues = {
  partnerId: string;
  description: string;
  purchaseItems: Array<{
    inventoryId: string;
    quantity: number;
    unitPrice: number;
  }>;
  purchasePayments: Array<{
    accountId: string;
    amount: number;
  }>;
  purchaseCashPayment: {
    amount: number;
  };
};

interface PurchaseFormProps {
  initialData?: IPurchaseView | null;
  onSubmit: (payload: INewPurchase) => void;
  isLoading?: boolean;
}

const defaultValues: PurchaseFormValues = {
  partnerId: "",
  description: "",
  purchaseItems: [{ inventoryId: "", quantity: 1, unitPrice: 0 }],
  purchasePayments: [],
  purchaseCashPayment: { amount: 0 },
};

export default function PurchaseForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PurchaseFormProps) {
  const { t } = useLanguage();
  const form = useForm<PurchaseFormValues>({ defaultValues });
  const { control, handleSubmit, setError, reset, watch, setValue } = form;

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "purchaseItems",
  });
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "purchasePayments",
  });

  const { data: partnersData } = useFetchPartnerSelector();
  const { data: inventoriesData } = useGetInventoriesInfinite({}, true);
  const { data: accountsData } = useFetchAccountSelector();

  const allInventories = useMemo(
    () => inventoriesData?.pages?.flatMap((page: any) => page.data ?? []) ?? [],
    [inventoriesData],
  );

  const partnerOptions = useMemo(
    () =>
      (partnersData?.data ?? []).map((partner: any) => ({
        label: partner.name,
        value: partner.id,
      })),
    [partnersData],
  );

  const inventoryOptions = useMemo(
    () =>
      allInventories.map((inventory: any) => ({
        label: inventory.name,
        value: inventory.id,
      })),
    [allInventories],
  );

  const accountOptions = useMemo(
    () =>
      (accountsData?.data ?? []).map((account: any) => ({
        label: `${account.name} (${formatCurrency(account.balance)})`,
        value: account.id,
      })),
    [accountsData],
  );

  useEffect(() => {
    if (!initialData) return;

    reset({
      partnerId: initialData.partnerId
        ? String(initialData.partnerId)
        : initialData.partner?.id
          ? String(initialData.partner.id)
          : "",
      description: initialData.description || "",
      purchaseItems:
        initialData.purchaseItems?.map((item: any) => ({
          inventoryId: item.inventory?.id || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        })) || defaultValues.purchaseItems,
      purchasePayments:
        initialData.purchasePayments?.map((payment: any) => ({
          accountId: payment.account?.id || payment.accountId || "",
          amount: Number(payment.amount) || 0,
        })) || [],
      purchaseCashPayment: {
        amount: Number(initialData.purchaseCashPayment?.amount) || 0,
      },
    });
  }, [initialData, reset]);

  // Financial Calculations
  const watchedItems = useWatch({ control, name: "purchaseItems" });
  const watchedBankPayments = useWatch({ control, name: "purchasePayments" });
  const watchedCashPayment = useWatch({ control, name: "purchaseCashPayment" });

  const grandTotal = (watchedItems ?? []).reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );

  const totalPaid =
    (watchedBankPayments ?? []).reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0,
    ) + Number(watchedCashPayment?.amount || 0);

  const outstandingBalance = Math.max(0, grandTotal - totalPaid);

  const handleFormSubmit = (values: PurchaseFormValues) => {
    const sanitizedItems = values.purchaseItems.filter(
      (item) => item.inventoryId && Number(item.quantity) > 0,
    );
    if (sanitizedItems.length === 0) {
      setError("purchaseItems", {
        type: "manual",
        message: "At least one valid item is required.",
      });
      return;
    }

    const sanitizedPayments = values.purchasePayments
      .filter((payment) => payment.accountId && Number(payment.amount) > 0)
      .map((payment) => ({
        accountId: payment.accountId,
        amount: Number(payment.amount),
      }));

    onSubmit({
      partnerId: values.partnerId,
      description: values.description?.trim() || undefined,
      purchaseItems: sanitizedItems.map((item) => ({
        inventoryId: item.inventoryId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        id: "",
      })),
      paymentItems: sanitizedPayments,
      purchaseCashPayment:
        Number(values.purchaseCashPayment.amount) > 0
          ? { amount: Number(values.purchaseCashPayment.amount) }
          : undefined,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="max-w-7xl mx-auto pb-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t("purchase.detail.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SelectField
                  name="partnerId"
                  control={control as any}
                  label={t("purchase.form.supplier")}
                  placeholder={t("purchase.form.selectPartner")}
                  options={partnerOptions}
                />
                <TextAreaField
                  name="description"
                  control={control as any}
                  label={t("purchase.form.description")}
                  placeholder={t("purchase.form.description")}
                />
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  {t("purchase.form.items.title")}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 border-primary text-primary hover:bg-primary/5"
                  onClick={() =>
                    appendItem({ inventoryId: "", quantity: 1, unitPrice: 0 })
                  }
                >
                  {t("purchase.form.items.addItem")}
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="min-w-[750px] space-y-3">
                  {/* Header Row */}
                  <div className="grid grid-cols-11 gap-3 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="col-span-4">{t("purchase.form.items.item")}</div>
                    <div className="col-span-2">{t("purchase.form.items.qty")}</div>
                    <div className="col-span-2">{t("purchase.form.items.unitPrice")}</div>
                    <div className="col-span-2">{t("purchase.form.items.subTotal")}</div>
                    <div className="col-span-1 text-center">{t("common.action")}</div>
                  </div>

                  {itemFields.map((field, index) => {
                    const itemTotal =
                      Number(watchedItems?.[index]?.quantity || 0) *
                      Number(watchedItems?.[index]?.unitPrice || 0);

                    return (
                      <div
                        key={field.id}
                        className="grid grid-cols-11 gap-3 items-start p-2 rounded-lg border hover:border-primary/30 transition-colors"
                      >
                        <div className="col-span-4 min-w-[250px]">
                          <SelectField
                            name={`purchaseItems.${index}.inventoryId`}
                            control={control as any}
                            placeholder={t("purchase.form.items.selectItem")}
                            options={inventoryOptions}
                            onValueChange={(val) => {
                              const item = allInventories.find(
                                (it: any) => it.id === val,
                              );
                              if (item) {
                                setValue(
                                  `purchaseItems.${index}.unitPrice`,
                                  Number(item.boughtPrice) || 0,
                                );
                              }
                            }}
                          />
                        </div>
                        <div className="col-span-2 min-w-[100px]">
                          <NumericField
                            name={`purchaseItems.${index}.quantity`}
                            control={control as any}
                            // label="Qty"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2 min-w-[120px]">
                          <NumericField
                            name={`purchaseItems.${index}.unitPrice`}
                            control={control as any}
                            // label="Unit Price"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2 min-w-[120px]">
                          <div className="h-9 flex items-center px-3 rounded-md bg-muted/50 border text-sm font-bold text-primary">
                            {formatCurrency(itemTotal)}
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center min-w-[50px]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(index)}
                            disabled={itemFields.length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Consolidated Payment Section */}
            <Card className="shadow-sm border-primary/10">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {t("purchase.detail.accordion.payments")}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Cash Payment Row */}
                <div className="flex justify-between items-center gap-2 space-x-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    <Banknote className="h-5 w-5" />
                    {t("purchase.form.cashPay.title")}
                  </div>
                  <div className="w-[40%]">
                    <NumericField
                      name="purchaseCashPayment.amount"
                      control={control as any}
                      placeholder="Enter cash amount"
                    />
                  </div>
                </div>

                <div className="border-t border-dashed pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                      <Building2 className="h-5 w-5" />
                      {t("purchase.form.bankPay.title")}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[12px] border-blue-200 text-blue-600 hover:bg-blue-50"
                      onClick={() =>
                        appendPayment({ accountId: "", amount: 0 })
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("purchase.form.bankPay.addPayment")}
                    </Button>
                  </div>

                  {paymentFields.length === 0 && (
                    <div className="py-6 text-center text-muted-foreground text-[10px] font-medium border border-dashed rounded-lg bg-muted/20">
                      {t("common.formHints.noBankPayments")}
                    </div>
                  )}

                  <div className="space-y-3">
                    {paymentFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-2 group"
                      >
                        <div className="flex flex-1 items-start gap-2">
                          <div className="w-[60%] shrink-0">
                            <SelectField
                              name={`purchasePayments.${index}.accountId`}
                              control={control as any}
                              placeholder={t("purchase.form.bankPay.selectAcc")}
                              options={accountOptions}
                            />
                          </div>
                          <div className="w-[40%] shrink-0">
                            <NumericField
                              name={`purchasePayments.${index}.amount`}
                              control={control as any}
                              placeholder="Amount"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10"
                          onClick={() => removePayment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Final Summary & Submit (Sticky) */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  {t("purchase.detail.payment.total")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("purchase.form.total.grand")}
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {formatCurrency(grandTotal)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      {t("purchase.form.total.paid")}
                    </span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>

                  <div
                    className={`flex justify-between items-center p-3 rounded-lg border ${outstandingBalance > 0 ? "bg-rose-50 border-rose-100" : "bg-muted/50 border-muted-foreground/10"}`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${outstandingBalance > 0 ? "text-rose-600" : "text-muted-foreground"}`}
                    >
                      {t("purchase.form.total.loan")}
                    </span>
                    <span
                      className={`text-lg font-bold ${outstandingBalance > 0 ? "text-rose-700" : "text-muted-foreground"}`}
                    >
                      {formatCurrency(outstandingBalance)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <SubmitButton
                    title={initialData ? t("purchase.form.editPur") : t("purchase.form.addPur")}
                    loading={isLoading}
                    className="w-full py-5 text-base font-bold shadow-md shadow-primary/10"
                  />
                  <p className="text-[10px] text-center text-muted-foreground leading-tight px-4">
                    {t("common.formHints.balanceUpdateWarning")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
