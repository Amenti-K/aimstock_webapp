"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import {
  inventorySchema,
  QuickInventoryFormValues,
  QuickInventorySchema,
  type inventoryFormValues,
} from "@/components/schema/inventory.schema";
import { useTranslation } from "react-i18next";
import { IInventory } from "../../interface/inventory/inventory.interface";
import {
  useFetchCategories,
  useCreateCategory,
} from "@/api/inventory/api.inventory";
import CategoryForm from "@/components/forms/category/categoryForm";

type InventoryFormProps = {
  initialData?: IInventory | null;
  onSubmit: (payload: inventoryFormValues) => void;
  isLoading?: boolean;
  isEdit?: boolean;
  showHint?: boolean;
  onCancel?: () => void;
};

const defaultValues: QuickInventoryFormValues = {
  sku: "",
  name: "",
  brand: "",
  boughtPrice: 0,
  sellingPrice: 0,
  unit: "",
  inventoryCategoryId: "",
};

export default function InventoryQuickForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
  showHint = isEdit,
  onCancel,
}: InventoryFormProps) {
  const { t } = useTranslation();
  const form = useForm<QuickInventoryFormValues>({
    defaultValues,
    resolver: zodResolver(QuickInventorySchema),
  });
  const { control, handleSubmit, reset, watch } = form;
  const {
    data: categoriesData,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useFetchCategories();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const { mutate: createCategory, isPending: creatingCategory } =
    useCreateCategory();

  const handleCategoryCreated = (values: any) => {
    createCategory(values, {
      onSuccess: (data: any) => {
        const newId = data?.data?.id ?? data?.id;
        refetchCategories().then(() => {
          if (newId) form.setValue("inventoryCategoryId", String(newId));
        });
        setShowAddCategory(false);
      },
    });
  };

  useEffect(() => {
    if (!initialData) return;
    reset({
      sku: initialData.sku || "",
      name: initialData.name || "",
      brand: initialData.brand || "",
      boughtPrice: Number(initialData.boughtPrice) || 0,
      sellingPrice: Number(initialData.sellingPrice) || 0,
      unit: initialData.unit || "",
      inventoryCategoryId: initialData.inventoryCategory?.id || "",
    });
  }, [initialData, reset]);

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesData],
  );

  const handleFormSubmit = (values: QuickInventoryFormValues) => {
    const payload: Partial<inventoryFormValues> = {
      ...values,
      sku: values.sku || undefined,
      brand: values.brand || undefined,
      inventoryCategoryId: values.inventoryCategoryId || undefined,
      boughtPrice: Number(values.boughtPrice),
      sellingPrice: Number(values.sellingPrice),
      initialQuantity: 0,
      warehouseInventories: [],
    };

    onSubmit(payload as inventoryFormValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              name="name"
              control={control as any}
              label={t("inventory.form.name")}
              placeholder={t("inventory.card.name")}
            />
            <TextField
              name="sku"
              control={control as any}
              label={t("inventory.form.sku")}
              placeholder="CRN-0001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              name="inventoryCategoryId"
              control={control as any}
              label={t("category.form.title")}
              placeholder={t("category.form.placeholder")}
              options={categoryOptions}
              canAdd
              addLabel={t("category.form.add")}
              onAddClick={() => setShowAddCategory(true)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <div className="flex-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-full w-full px-8"
              onClick={() => (onCancel ? onCancel() : window.history.back())}
            >
              {t("common.cancel")}
            </Button>
          </div>
          <div className="flex-1">
            <SubmitButton
              title={
                isEdit ? t("inventory.form.edit") : t("inventory.form.add")
              }
              loading={isLoading}
              className="w-auto px-10 rounded-full w-full shadow-lg shadow-primary/20"
            />
          </div>
        </div>
      </form>

      {/* ── Quick-Add Category Dialog ────────────────────────────────────── */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5 text-primary" />
              {t("category.form.add", { defaultValue: "Add New Category" })}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCategoryCreated}
            onCancel={() => setShowAddCategory(false)}
            isPending={creatingCategory}
          />
        </DialogContent>
      </Dialog>
    </Form>
  );
}
