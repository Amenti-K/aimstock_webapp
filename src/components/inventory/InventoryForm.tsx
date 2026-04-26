"use client";

import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Trash2,
  Plus,
  Info,
  Warehouse,
  Package,
  BadgeDollarSign,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import {
  inventorySchema,
  type inventoryFormValues,
} from "@/components/schema/inventory.schema";
import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { IInventory } from "../interface/inventory/inventory.interface";

type InventoryFormProps = {
  initialData?: IInventory | null;
  onSubmit: (payload: inventoryFormValues) => void;
  isLoading?: boolean;
  isEdit?: boolean;
};

const defaultValues: inventoryFormValues = {
  sku: "",
  name: "",
  brand: "",
  boughtPrice: 0,
  sellingPrice: 0,
  unit: "",
  initialQuantity: 0,
  warehouseInventories: [{ warehouseId: "", quantity: 0, reorderQuantity: 0 }],
};

export default function InventoryForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: InventoryFormProps) {
  const { t } = useTranslation();
  const form = useForm<inventoryFormValues>({
    defaultValues,
    resolver: zodResolver(inventorySchema),
  });
  const { control, handleSubmit, reset, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "warehouseInventories",
  });
  const { data: warehousesData, isLoading: loadingWarehouses } =
    useFetchWarehouseSelector();

  const hasTransactions = isEdit && !!initialData?.hasTransactions;
  const canEditDistribution = !hasTransactions;

  useEffect(() => {
    if (!initialData) return;
    reset({
      sku: initialData.sku || "",
      name: initialData.name || "",
      brand: initialData.brand || "",
      boughtPrice: Number(initialData.boughtPrice) || 0,
      sellingPrice: Number(initialData.sellingPrice) || 0,
      unit: initialData.unit || "",
      initialQuantity: Number(initialData.initialQuantity) || 0,
      warehouseInventories:
        initialData.warehouseInventories?.map((wi) => ({
          warehouseId: wi.warehouseId,
          quantity: Number(wi.quantity) || 0,
          reorderQuantity: Number(wi.reorderQuantity) || 0,
        })) || defaultValues.warehouseInventories,
    });
  }, [initialData, reset]);

  const warehouseOptions = useMemo(
    () =>
      (warehousesData?.data ?? []).map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.name}${warehouse.isInternal ? ` (${t("warehouse.card.isInternal")})` : ""}`,
      })),
    [warehousesData, t],
  );

  const watchedWarehouses = watch("warehouseInventories");
  const optionsForRow = (index: number) => {
    const selectedIds = (watchedWarehouses ?? [])
      .map((w) => w?.warehouseId)
      .filter(Boolean);
    const currentId = watchedWarehouses?.[index]?.warehouseId;
    return warehouseOptions.filter((option) => {
      if (option.value === currentId) return true;
      return !selectedIds.includes(option.value);
    });
  };

  const handleFormSubmit = (values: inventoryFormValues) => {
    const payload: Partial<inventoryFormValues> = {
      ...values,
      sku: values.sku || undefined,
      brand: values.brand || undefined,
      boughtPrice: Number(values.boughtPrice),
      sellingPrice: Number(values.sellingPrice),
      initialQuantity: Number(values.initialQuantity),
      warehouseInventories: values.warehouseInventories.map((warehouse) => ({
        warehouseId: warehouse.warehouseId,
        quantity: Number(warehouse.quantity),
        reorderQuantity: Number(warehouse.reorderQuantity),
      })),
    };

    if (hasTransactions) {
      delete payload.initialQuantity;
      delete payload.warehouseInventories;
    }

    onSubmit(payload as inventoryFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {hasTransactions && (
          <div className="flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-700 dark:text-yellow-500/80">
            <Info className="h-5 w-5 shrink-0" />
            <p className="font-medium leading-relaxed">
              {t("common.formHints.balanceUpdateWarning")}
            </p>
          </div>
        )}

        <Card className="rounded-[1.5rem] border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  {t("inventory.form.inventoryInfo", {
                    defaultValue: "Inventory Information",
                  })}
                </CardTitle>
                <CardDescription>
                  {t("inventory.form.inventoryInfoDesc", {
                    defaultValue: "Enter basic item details and pricing",
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6">
            <TextField
              name="sku"
              control={control as any}
              label={t("inventory.form.sku")}
              placeholder="CRN-0001"
            />
            <TextField
              name="name"
              control={control as any}
              label={t("inventory.form.name")}
              placeholder={t("inventory.card.name")}
            />
            <TextField
              name="brand"
              control={control as any}
              label={t("inventory.form.brand")}
              placeholder={t("inventory.card.brand")}
            />
            <TextField
              name="unit"
              control={control as any}
              label={t("inventory.form.unit")}
              placeholder="pcs, kg, etc."
            />
            <NumericField
              name="boughtPrice"
              control={control as any}
              label={t("inventory.form.boughtPrice")}
              placeholder="0"
            />
            <NumericField
              name="sellingPrice"
              control={control as any}
              label={t("inventory.form.sellingPrice")}
              placeholder="0"
            />
            {canEditDistribution && (
              <div className="md:col-span-2 pt-2">
                <NumericField
                  name="initialQuantity"
                  control={control as any}
                  label={t("inventory.form.initialQty")}
                  placeholder="0"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {canEditDistribution && (
          <Card className="rounded-[1.5rem] border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    {t("inventory.form.wareInv.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("inventory.form.wareInv.description", {
                      defaultValue:
                        "Distribute stock across different locations",
                    })}
                  </CardDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full bg-background border-none shadow-sm"
                onClick={() =>
                  append({
                    warehouseId: "",
                    quantity: 0,
                    reorderQuantity: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("inventory.form.wareInv.addWare")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative grid grid-cols-1 gap-4 rounded-2xl border bg-muted/20 p-5 md:grid-cols-4 items-end"
                >
                  <SelectField
                    name={`warehouseInventories.${index}.warehouseId`}
                    control={control as any}
                    label={t("inventory.form.wareInv.ware")}
                    placeholder={
                      loadingWarehouses
                        ? t("inventory.form.wareInv.loadingWare")
                        : t("inventory.form.wareInv.selectWare")
                    }
                    options={optionsForRow(index)}
                  />
                  <NumericField
                    name={`warehouseInventories.${index}.quantity`}
                    control={control as any}
                    label={t("inventory.form.wareInv.qty")}
                    placeholder="0"
                  />
                  <NumericField
                    name={`warehouseInventories.${index}.reorderQuantity`}
                    control={control as any}
                    label={t("inventory.form.wareInv.reorderQty")}
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl self-end md:justify-self-center"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-8"
            onClick={() => window.history.back()}
          >
            {t("common.cancel")}
          </Button>
          <SubmitButton
            title={isEdit ? t("inventory.form.edit") : t("inventory.form.add")}
            loading={isLoading}
            className="w-auto px-10 rounded-full shadow-lg shadow-primary/20"
          />
        </div>
      </form>
    </Form>
  );
}
