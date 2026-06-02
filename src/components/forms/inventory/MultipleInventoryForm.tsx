"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  Warehouse,
  PlusIcon,
} from "lucide-react";

import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import {
  useCreateBulkInventory,
  useFetchCategories,
  useCreateCategory,
} from "@/api/inventory/api.inventory";
import {
  inventoriesArraySchema,
  inventoriesArrayFormValues,
} from "@/components/schema/inventory.schema";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TextField from "@/components/forms/fields/TextField";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import DateField from "@/components/forms/fields/DateField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import CategoryForm from "@/components/forms/category/categoryForm";

export default function MultipleInventoryForm({
  onCancel,
}: {
  onCancel?: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation();

  const { data: warehousesResponse, isLoading: loadingWarehouses } =
    useFetchWarehouseSelector();
  const warehouses = warehousesResponse?.data || [];

  const { data: categoriesData, refetch: refetchCategories } =
    useFetchCategories();

  const { mutate: createCategory, isPending: creatingCategory } =
    useCreateCategory();

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(
    null,
  );

  const warehouseOptions = useMemo(
    () =>
      warehouses.map((warehouse) => ({
        value: warehouse.id,
        label: `${warehouse.name}${warehouse.isInternal ? ` (${t("warehouse.card.isInternal")})` : ""}`,
      })),
    [warehouses, t],
  );

  const categoryOptions = useMemo(
    () =>
      (categoriesData?.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [categoriesData],
  );

  const { mutateAsync: createBulkInventory, isPending } =
    useCreateBulkInventory();

  const form = useForm<inventoriesArrayFormValues>({
    resolver: zodResolver(inventoriesArraySchema),
    defaultValues: {
      inventories: [
        {
          name: "",
          sku: "",
          unit: "",
          brand: "",
          boughtPrice: 0,
          sellingPrice: 0,
          initialQuantity: 0,
          expiryDate: "",
          inventoryCategoryId: "",
          warehouseInventories: [
            { warehouseId: "", quantity: 0, reorderQuantity: 0 },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "inventories",
  });

  const handleAdd = () => {
    append({
      name: "",
      sku: "",
      unit: "",
      brand: "",
      boughtPrice: 0,
      sellingPrice: 0,
      initialQuantity: 0,
      expiryDate: "",
      inventoryCategoryId: "",
      warehouseInventories: [
        { warehouseId: "", quantity: 0, reorderQuantity: 0 },
      ],
    });
  };

  const handleCategoryCreated = (values: any) => {
    createCategory(values, {
      onSuccess: (data: any) => {
        const newId = data?.data?.id ?? data?.id;
        refetchCategories().then(() => {
          if (newId && activeCategoryIndex !== null) {
            form.setValue(
              `inventories.${activeCategoryIndex}.inventoryCategoryId`,
              String(newId),
            );
          }
        });
        setShowAddCategory(false);
        setActiveCategoryIndex(null);
      },
    });
  };

  const onSubmit = async (values: inventoriesArrayFormValues) => {
    try {
      const payload = {
        inventories: values.inventories.map((inv) => ({
          ...inv,
          sku: inv.sku || undefined,
          brand: inv.brand || undefined,
          expiryDate: inv.expiryDate || undefined,
          inventoryCategoryId: inv.inventoryCategoryId || undefined,
          boughtPrice: Number(inv.boughtPrice),
          sellingPrice: Number(inv.sellingPrice),
          initialQuantity: Number(inv.initialQuantity),
          warehouseInventories: inv.warehouseInventories.map((warehouse) => ({
            warehouseId: warehouse.warehouseId,
            quantity: Number(warehouse.quantity),
            reorderQuantity: Number(warehouse.reorderQuantity),
          })),
        })),
      };

      await createBulkInventory(payload as any);
      router.push("/inventory");
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingWarehouses) {
    return (
      <div className="flex w-full min-h-[30vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="fade-in-up border-none bg-card shadow-sm rounded-[1.5rem] overflow-hidden relative"
            >
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-destructive hover:bg-destructive/10 hover:text-destructive z-20"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <div className="flex px-6 pb-4 pt-6 items-center gap-3 border-b bg-muted/20">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    {t("setup.step2.cardTitle", { index: index + 1 })}
                  </CardTitle>
                  <CardDescription>
                    {t("inventory.form.inventoryInfoDesc")}
                  </CardDescription>
                </div>
              </div>
              <CardContent className="space-y-8 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextField
                    name={`inventories.${index}.name`}
                    control={form.control as any}
                    label={t("inventory.form.name")}
                    placeholder={t("inventory.card.name")}
                  />
                  <TextField
                    name={`inventories.${index}.sku`}
                    control={form.control as any}
                    label={t("inventory.form.sku")}
                    placeholder="CRN-0001"
                  />
                  <TextField
                    name={`inventories.${index}.brand`}
                    control={form.control as any}
                    label={t("inventory.form.brand")}
                    placeholder={t("inventory.card.brand")}
                  />
                  <NumericField
                    name={`inventories.${index}.boughtPrice`}
                    control={form.control as any}
                    label={t("inventory.form.boughtPrice")}
                    placeholder="0"
                  />
                  <NumericField
                    name={`inventories.${index}.sellingPrice`}
                    control={form.control as any}
                    label={t("inventory.form.sellingPrice")}
                    placeholder="0"
                  />
                  <TextField
                    name={`inventories.${index}.unit`}
                    control={form.control as any}
                    label={t("inventory.form.unit")}
                    placeholder="pcs, kg, etc."
                  />
                  <SelectField
                    name={`inventories.${index}.inventoryCategoryId`}
                    control={form.control as any}
                    label={t("category.form.title")}
                    placeholder={t("category.form.placeholder")}
                    options={categoryOptions}
                    canAdd
                    addLabel={t("category.form.add")}
                    onAddClick={() => {
                      setActiveCategoryIndex(index);
                      setShowAddCategory(true);
                    }}
                  />
                  <DateField
                    name={`inventories.${index}.expiryDate`}
                    control={form.control as any}
                    label={t("inventory.form.expiryDate")}
                    placeholder="YYYY-MM-DD"
                  />
                  <NumericField
                    name={`inventories.${index}.initialQuantity`}
                    control={form.control as any}
                    label={t("inventory.form.initialQty")}
                    placeholder="0"
                  />
                </div>

                <div className="pt-6 border-t mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Warehouse className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold">
                        {t("inventory.form.wareInv.title")}
                      </h4>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full shadow-sm bg-background border-none text-xs"
                      onClick={() => {
                        const currentWares = form.getValues(
                          `inventories.${index}.warehouseInventories`,
                        );
                        form.setValue(
                          `inventories.${index}.warehouseInventories`,
                          [
                            ...currentWares,
                            {
                              warehouseId: "",
                              quantity: 0,
                              reorderQuantity: 0,
                            },
                          ],
                        );
                      }}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {t("inventory.form.wareInv.addWare")}
                    </Button>
                  </div>

                  <WarehouseDistribution
                    index={index}
                    control={form.control}
                    warehouseOptions={warehouseOptions}
                    t={t}
                    form={form}
                  />
                </div>
              </CardContent>
            </div>
          ))}

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              className="rounded-full px-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("setup.step2.addAnother", {
                defaultValue: "Add Another Item",
              })}
            </Button>

            <div className="flex gap-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={onCancel}
                >
                  {t("common.cancel")}
                </Button>
              )}
              <SubmitButton
                title={t("common.save", { defaultValue: "Save All" })}
                loading={isPending}
                className="w-auto px-10 rounded-full shadow-lg shadow-primary/20"
              />
            </div>
          </div>
        </form>
      </Form>

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
            onCancel={() => {
              setShowAddCategory(false);
              setActiveCategoryIndex(null);
            }}
            isPending={creatingCategory}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function WarehouseDistribution({
  index,
  control,
  warehouseOptions,
  t,
  form,
}: any) {
  const { fields, remove } = useFieldArray({
    control,
    name: `inventories.${index}.warehouseInventories`,
  });

  const watchedWarehouses = form.watch(
    `inventories.${index}.warehouseInventories`,
  );

  const optionsForRow = (wIndex: number) => {
    const selectedIds = (watchedWarehouses ?? [])
      .map((w: any) => w?.warehouseId)
      .filter(Boolean);
    const currentId = watchedWarehouses?.[wIndex]?.warehouseId;
    return warehouseOptions.filter((option: any) => {
      if (option.value === currentId) return true;
      return !selectedIds.includes(option.value);
    });
  };

  return (
    <div className="space-y-4 w-full overflow-x-auto">
      {fields.map((field, wIndex) => (
        <div
          key={field.id}
          className="flex items-start gap-4 min-w-[600px] rounded-2xl border bg-muted/20 p-4"
        >
          <div className="flex-[5] min-w-0">
            <SelectField
              name={`inventories.${index}.warehouseInventories.${wIndex}.warehouseId`}
              control={control as any}
              label={t("inventory.form.wareInv.ware")}
              placeholder={t("inventory.form.wareInv.selectWare")}
              options={optionsForRow(wIndex)}
            />
          </div>
          <div className="flex-[2] min-w-0">
            <NumericField
              name={`inventories.${index}.warehouseInventories.${wIndex}.quantity`}
              control={control as any}
              label={t("inventory.form.wareInv.qty")}
              placeholder="0"
            />
          </div>
          <div className="flex-[2] min-w-0">
            <NumericField
              name={`inventories.${index}.warehouseInventories.${wIndex}.reorderQuantity`}
              control={control as any}
              label={t("inventory.form.wareInv.reorderQty")}
              placeholder="0"
            />
          </div>
          <div className="flex-[1] flex justify-center items-end h-full mt-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
              onClick={() => remove(wIndex)}
              disabled={fields.length === 1}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
