"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2, Info, Package, AlertCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useFetchWarehouseInventorySelector } from "@/api/inventory/api.inventory";
import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import { Button } from "@/components/ui/button";
import {
  AdjustmentFormValues,
  adjustmentSchema,
} from "@/components/schema/adjustment.schema";
import { useLanguage } from "@/hooks/language.hook";
import { cn } from "@/lib/utils";
import {
  IAdjustment,
  IAdjustmentType,
} from "@/components/interface/adjustment/adjustment.interface";
import SelectSearchField from "../fields/SelectSearchField";
import { toast } from "sonner";

interface Props {
  item?: IAdjustment | null;
  onSubmit: (values: AdjustmentFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function AdjustmentForm({
  item,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: Props) {
  const { t } = useLanguage();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      warehouseId: item?.warehouseId || item?.warehouse?.id || "",
      type: (item?.type as IAdjustmentType) || ("" as IAdjustmentType),
      note: item?.note || "",
      items: item?.items
        ? (item.items as any[]).map((i) => ({
            inventoryId: i.inventoryId || i.inventory?.id || "",
            quantity: i.quantity || 0,
            toWarehouseId: i.toWarehouseId || i.toWarehouse?.id || undefined,
          }))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const sourceWarehouseId = useWatch({ control, name: "warehouseId" });
  const type = useWatch({ control, name: "type" });
  const watchedItems = useWatch({ control, name: "items" }) || [];

  const { data: warehouses, isPending: loadingWarehouses } =
    useFetchWarehouseSelector();
  const { data: inventorySelector, isPending: loadingInventories } =
    useFetchWarehouseInventorySelector(
      sourceWarehouseId || "",
      !!sourceWarehouseId,
    );

  const warehouseOptions = useMemo(() => {
    if (!Array.isArray(warehouses?.data)) return [];
    return warehouses.data.map((w: any) => ({
      value: w.id,
      label: w.name || w.warehouse?.name || "Unknown Warehouse",
    }));
  }, [warehouses]);

  const typeOptions = [
    {
      value: IAdjustmentType.stockIn,
      label: t("adjustment.types.stockIn"),
    },
    {
      value: IAdjustmentType.stockOut,
      label: t("adjustment.types.stockOut"),
    },
    ...(warehouseOptions.length > 1
      ? [
          {
            value: IAdjustmentType.transfer,
            label: t("adjustment.types.transfer"),
          },
        ]
      : []),
  ];

  const inventoryOptions = useMemo(() => {
    if (!Array.isArray(inventorySelector?.data)) return [];
    return inventorySelector.data.map((w: any) => ({
      value: w.inventory.id,
      label: `${w.inventory.name} - ${w.quantity} ${w.inventory.unit}`,
      raw: w,
    }));
  }, [inventorySelector]);

  useEffect(() => {
    if (loadingWarehouses || !Array.isArray(warehouses?.data)) return;

    if (warehouseOptions.length === 1) {
      if (sourceWarehouseId !== warehouseOptions[0].value) {
        setValue("warehouseId", warehouseOptions[0].value);
      }
      if (type === IAdjustmentType.transfer) {
        setValue("type", "" as IAdjustmentType);
      }
    }
  }, [
    loadingWarehouses,
    setValue,
    sourceWarehouseId,
    type,
    warehouseOptions,
    warehouses,
  ]);

  // Allocation map mirroring mobile app for remaining stock calculations
  const allocationMap = useMemo(() => {
    const map: Record<string, number> = {};
    watchedItems.forEach((it) => {
      if (it?.inventoryId) {
        map[it.inventoryId] =
          (map[it.inventoryId] || 0) + (Number(it.quantity) || 0);
      }
    });
    return map;
  }, [watchedItems]);

  const getOptionsForInventory = (idx: number) => {
    if (type === IAdjustmentType.transfer) {
      return inventoryOptions;
    }
    const selectedIds = watchedItems
      .map((w, i) => (i !== idx ? w?.inventoryId : null))
      .filter(Boolean);

    return inventoryOptions.filter((opt) => !selectedIds.includes(opt.value));
  };

  const getDestWarehouseOptions = (idx: number) => {
    if (!sourceWarehouseId) return [];
    const currentInventoryId = watchedItems?.[idx]?.inventoryId;

    let filtered = warehouseOptions.filter(
      (w) => w.value !== sourceWarehouseId,
    );

    if (type === IAdjustmentType.transfer && currentInventoryId) {
      const alreadyChosenWarehouses = watchedItems
        .map((w, i) =>
          i !== idx && w?.inventoryId === currentInventoryId
            ? w?.toWarehouseId
            : null,
        )
        .filter(Boolean);

      filtered = filtered.filter(
        (w) => !alreadyChosenWarehouses.includes(w.value),
      );
    }

    return filtered;
  };

  const getStockInfo = (inventoryId: string) => {
    if (!inventoryId) return null;
    const inv = inventoryOptions.find((opt) => opt.value === inventoryId);
    if (!inv) return null;

    const totalStock = Number(inv.raw.quantity);
    const totalAllocated = allocationMap[inventoryId] || 0;
    const remainingStock = totalStock - totalAllocated;

    return {
      total: totalStock,
      remaining: remainingStock,
      unit: inv.raw.inventory.unit,
    };
  };

  const isStep1Complete = !!sourceWarehouseId && !!type;

  const getQuantityLabel = () => {
    if (type === IAdjustmentType.stockIn)
      return t("adjustment.form.quantityAdd");
    if (type === IAdjustmentType.stockOut)
      return t("adjustment.form.quantityRemove");
    if (type === IAdjustmentType.transfer)
      return t("adjustment.form.quantityTransfer");
    return t("adjustment.form.quantity");
  };

  const onFormSubmit = (values: AdjustmentFormValues) => {
    if (
      type === IAdjustmentType.stockOut ||
      type === IAdjustmentType.transfer
    ) {
      for (const invId of Object.keys(allocationMap)) {
        const info = getStockInfo(invId);
        if (info && info.remaining < 0) {
          const itemLabel = inventoryOptions.find(
            (o) => o.value === invId,
          )?.label;
          toast.error(
            `${t("adjustment.form.errorExcessiveStock")}: ${itemLabel || ""}`,
          );
          return;
        }
      }
    }

    const payload = {
      ...values,
      items: values.items.map((it) => ({
        ...it,
        quantity: Math.abs(Number(it.quantity)),
        toWarehouseId: it.toWarehouseId ? it.toWarehouseId : undefined,
      })),
    };
    onSubmit(payload as any);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* Step 1: Basic Information */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h3 className="font-bold">{t("adjustment.form.basicInfoTitle")}</h3>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground -mt-2">
            {t("adjustment.form.basicInfoDescription")}
          </p>

          <div
            className={cn(
              "grid grid-cols-1 gap-6",
              warehouseOptions.length !== 1 && "md:grid-cols-2",
            )}
          >
            <SelectField
              name="type"
              control={control as any}
              label={t("adjustment.form.typeLabel")}
              placeholder={t("adjustment.form.selectType")}
              options={typeOptions}
              onValueChange={() => {
                setValue("items", []);
              }}
            />
            {warehouseOptions.length !== 1 && (
              <SelectField
                name="warehouseId"
                control={control as any}
                label={t("adjustment.form.sourceWarehouse")}
                placeholder={
                  loadingWarehouses
                    ? t("common.loading")
                    : t("adjustment.form.selectSource")
                }
                options={warehouseOptions}
                onValueChange={() => {
                  setValue("items", []);
                }}
              />
            )}
          </div>

          <TextAreaField
            name="note"
            control={control as any}
            label={t("adjustment.form.notes")}
            placeholder={t("adjustment.form.notesPlaceholder")}
          />
        </div>
      </div>

      {/* Step 2: Items */}
      <div
        className={cn(
          "rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300",
          !isStep1Complete && "opacity-50 grayscale pointer-events-none",
        )}
      >
        <div className="bg-muted/30 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-bold">{t("adjustment.form.itemsTitle")}</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={!isStep1Complete}
            onClick={() =>
              append({
                inventoryId: "",
                quantity: 1,
                toWarehouseId:
                  type === IAdjustmentType.transfer ? "" : undefined,
              })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("adjustment.form.addItem")}
          </Button>
        </div>

        <div className="p-6 space-y-4 overflow-x-auto custom-scrollbar">
          {!isStep1Complete && (
            <div className="flex items-center justify-center py-8 text-center text-muted-foreground italic">
              {t("adjustment.form.selectSourceAndType")}
            </div>
          )}

          {fields.map((field, index) => {
            const isTransfer = type === IAdjustmentType.transfer;
            const selectedInvId = watchedItems?.[index]?.inventoryId;
            const stockInfo = getStockInfo(selectedInvId);

            return (
              <div
                key={field.id}
                className={cn(
                  "group flex flex-col gap-3 p-4 rounded-xl bg-muted/10 hover:bg-muted/20 transition-all border border-border/40",
                )}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-[3] min-w-[200px]">
                    <SelectSearchField
                      name={`items.${index}.inventoryId`}
                      control={control as any}
                      label={t("adjustment.form.inventoryItem")}
                      placeholder={
                        loadingInventories
                          ? t("common.loading")
                          : t("adjustment.form.selectItem")
                      }
                      options={getOptionsForInventory(index)}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="flex-1 min-w-[100px]">
                    <NumericField
                      name={`items.${index}.quantity`}
                      control={control as any}
                      label={getQuantityLabel()}
                    />
                  </div>

                  {/* To Warehouse — only shown for transfer */}
                  {isTransfer && (
                    <div className="flex-[2] min-w-[200px]">
                      <SelectField
                        name={`items.${index}.toWarehouseId`}
                        control={control as any}
                        label={t("adjustment.form.toWarehouse")}
                        placeholder={t("adjustment.form.selectDest")}
                        options={getDestWarehouseOptions(index)}
                      />
                    </div>
                  )}

                  {/* Delete button */}
                  <div className="flex-none pt-7">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stock info display mirroring mobile app */}
                {stockInfo &&
                  (type === IAdjustmentType.stockOut || isTransfer) && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 pl-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>
                        {t("adjustment.form.available")}: {stockInfo.total}{" "}
                        {stockInfo.unit} ({t("adjustment.form.remaining")}:{" "}
                        {stockInfo.remaining} {stockInfo.unit})
                      </span>
                    </div>
                  )}
              </div>
            );
          })}

          {fields.length === 0 && isStep1Complete && (
            <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
              <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
              <p className="text-muted-foreground">
                {t("adjustment.detail.noItems")}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={() =>
                  append({
                    inventoryId: "",
                    quantity: 1,
                    toWarehouseId:
                      type === IAdjustmentType.transfer ? "" : undefined,
                  })
                }
              >
                {t("adjustment.form.addItem")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {Array.isArray(errors.items) &&
        errors.items.map((error, index) =>
          error?.message ? (
            <div key={index} className="text-destructive text-sm font-medium">
              {error.message}
            </div>
          ) : null,
        )}
      {errors.items?.root?.message && (
        <div className="text-destructive text-sm font-medium">
          {errors.items.root.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <SubmitButton
          title={submitLabel || (item ? t("common.update") : t("common.save"))}
          loading={isPending}
          disabled={isPending || fields.length === 0}
          className="flex-1 h-12 rounded-xl text-lg shadow-lg shadow-primary/20"
        />
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-xl text-lg hover:bg-muted"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
