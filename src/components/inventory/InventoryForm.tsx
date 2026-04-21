"use client";

import React, { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import {
  inventorySchema,
  type inventoryFormValues,
} from "@/components/schema/inventory.schema";
import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import type { IInventory } from "@/api/inventory/api.inventory";

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
        label: `${warehouse.name}${warehouse.isInternal ? " (Internal)" : ""}`,
      })),
    [warehousesData],
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
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {hasTransactions && (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-900">
            This item has transactions, so initial quantity and warehouse
            distribution are locked for editing.
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inventory Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextField
              name="sku"
              control={control}
              label="SKU"
              placeholder="CRN-0001"
            />
            <TextField
              name="name"
              control={control}
              label="Name"
              placeholder="Item name"
            />
            <TextField
              name="brand"
              control={control}
              label="Brand"
              placeholder="Optional brand"
            />
            <TextField
              name="unit"
              control={control}
              label="Unit"
              placeholder="Piece"
            />
            <NumericField
              name="boughtPrice"
              control={control}
              label="Bought Price"
              placeholder="0"
            />
            <NumericField
              name="sellingPrice"
              control={control}
              label="Selling Price"
              placeholder="0"
            />
            {canEditDistribution && (
              <div className="md:col-span-2">
                <NumericField
                  name="initialQuantity"
                  control={control}
                  label="Initial Quantity"
                  placeholder="0"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {canEditDistribution && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Warehouse Distribution</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    warehouseId: "",
                    quantity: 0,
                    reorderQuantity: 0,
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-4"
                >
                  <SelectField
                    name={`warehouseInventories.${index}.warehouseId`}
                    control={control}
                    label="Warehouse"
                    placeholder={
                      loadingWarehouses ? "Loading..." : "Select warehouse"
                    }
                    options={optionsForRow(index)}
                  />
                  <NumericField
                    name={`warehouseInventories.${index}.quantity`}
                    control={control}
                    label="Quantity"
                    placeholder="0"
                  />
                  <NumericField
                    name={`warehouseInventories.${index}.reorderQuantity`}
                    control={control}
                    label="Reorder Quantity"
                    placeholder="0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-auto text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <SubmitButton
            title={isEdit ? "Update Inventory" : "Create Inventory"}
            loading={isLoading}
            className="w-auto"
          />
        </div>
      </form>
    </Form>
  );
}
