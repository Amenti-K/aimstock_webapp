"use client";

import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { useFetchPartnerSelector } from "@/api/partner/api.partner";
import { useGetInventoriesInfinite } from "@/api/inventory/api.inventory";
import { useFetchAccountSelector } from "@/api/account/api.account";
import type { INewPurchase, IPurchaseView } from "@/api/purchase/api.purchase";

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
    description?: string;
  }>;
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
  purchasePayments: [{ accountId: "", amount: 0, description: "" }],
};

export default function PurchaseForm({
  initialData,
  onSubmit,
  isLoading = false,
}: PurchaseFormProps) {
  const form = useForm<PurchaseFormValues>({ defaultValues });
  const { control, handleSubmit, setError, reset, watch } = form;

  const { fields: itemFields, append: appendItem, remove: removeItem } =
    useFieldArray({
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

  const partnerOptions = useMemo(
    () =>
      (partnersData?.data ?? []).map((partner: any) => ({
        label: partner.name,
        value: partner.id,
      })),
    [partnersData],
  );

  const inventoryOptions = useMemo(() => {
    const allInventories = inventoriesData?.pages?.flatMap(
      (page: any) => page.data ?? [],
    );
    return (allInventories ?? []).map((inventory: any) => ({
      label: inventory.name,
      value: inventory.id,
    }));
  }, [inventoriesData]);

  const accountOptions = useMemo(
    () =>
      (accountsData?.data ?? []).map((account: any) => ({
        label: account.name,
        value: account.id,
      })),
    [accountsData],
  );

  useEffect(() => {
    if (!initialData) return;

    reset({
      partnerId: initialData.partner?.id || initialData.partnerId || "",
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
          description: payment.description || "",
        })) || defaultValues.purchasePayments,
    });
  }, [initialData, reset]);

  const purchaseItems = watch("purchaseItems");
  const totalAmount = (purchaseItems ?? []).reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );

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
        description: payment.description?.trim() || undefined,
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
      purchasePayments: sanitizedPayments,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              name="partnerId"
              control={control}
              label="Supplier"
              placeholder="Select supplier"
              options={partnerOptions}
            />
            <TextAreaField
              name="description"
              control={control}
              label="Description"
              placeholder="Optional notes for this purchase"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => appendItem({ inventoryId: "", quantity: 1, unitPrice: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {itemFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <SelectField
                    name={`purchaseItems.${index}.inventoryId`}
                    control={control}
                    label="Inventory"
                    placeholder="Select inventory"
                    options={inventoryOptions}
                  />
                </div>
                <NumericField
                  name={`purchaseItems.${index}.quantity`}
                  control={control}
                  label="Quantity"
                  placeholder="0"
                />
                <div className="space-y-2">
                  <NumericField
                    name={`purchaseItems.${index}.unitPrice`}
                    control={control}
                    label="Unit Price"
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-destructive"
                    onClick={() => removeItem(index)}
                    disabled={itemFields.length === 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payments</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendPayment({
                  accountId: "",
                  amount: 0,
                  description: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-4">
                <SelectField
                  name={`purchasePayments.${index}.accountId`}
                  control={control}
                  label="Account"
                  placeholder="Select account"
                  options={accountOptions}
                />
                <NumericField
                  name={`purchasePayments.${index}.amount`}
                  control={control}
                  label="Amount"
                  placeholder="0"
                />
                <TextAreaField
                  name={`purchasePayments.${index}.description`}
                  control={control}
                  label="Description"
                  placeholder="Optional"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-auto text-destructive"
                  onClick={() => removePayment(index)}
                  disabled={paymentFields.length === 1}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Total item amount</p>
          <p className="text-xl font-semibold">{Number(totalAmount).toLocaleString()} ETB</p>
        </div>

        <div className="flex justify-end">
          <SubmitButton
            title={initialData ? "Update Purchase" : "Create Purchase"}
            loading={isLoading}
            className="w-auto"
          />
        </div>
      </form>
    </Form>
  );
}
