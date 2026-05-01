"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  Trash2,
  Info,
  Package,
  Warehouse,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { useFetchWarehouseInventorySelector } from "@/api/inventory/api.inventory";
import { useFetchWarehouseSelector } from "@/api/warehouse/api.warehouse";
import NumericField from "@/components/forms/fields/NumericField";
import SelectField from "@/components/forms/fields/SelectField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import { Button } from "@/components/ui/button";
import { AdjustmentFormValues, adjustmentSchema } from "./adjustment.schema";
import { useLanguage } from "@/hooks/language.hook";
import { cn } from "@/lib/utils";
import {
  IAdjustment,
  IAdjustmentType,
} from "@/components/interface/adjustment/adjustment.interface";

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
  const { control, handleSubmit, reset, setValue } =
    useForm<AdjustmentFormValues>({
      resolver: zodResolver(adjustmentSchema),
      defaultValues: {
        warehouseId: "",
        type: IAdjustmentType.stockIn,
        note: "",
        items: [],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const sourceWarehouseId = useWatch({ control, name: "warehouseId" });
  const type = useWatch({ control, name: "type" });

  const { data: warehouses } = useFetchWarehouseSelector();
  const { data: inventorySelector } = useFetchWarehouseInventorySelector(
    sourceWarehouseId || "",
    !!sourceWarehouseId,
  );

  useEffect(() => {
    if (!item) return;

    reset({
      warehouseId: item.warehouseId || item.warehouse?.id || "",
      type: item.type || IAdjustmentType.stockIn,
      note: item.note || "",
      items: (item.items || []).map((i: any) => ({
        inventoryId: i.inventoryId || i.inventory?.id || "",
        quantity: i.quantity || 0,
        toWarehouseId: i.toWarehouseId || i.toWarehouse?.id || undefined,
      })),
    });
  }, [item, reset]);

  // Clear items if warehouse changes to prevent invalid inventory items
  useEffect(() => {
    if (sourceWarehouseId && !item) {
      // Only clear if it's a new entry or warehouse changed manually
    }
  }, [sourceWarehouseId, item]);

  const warehouseOptions = useMemo(() => {
    if (!Array.isArray(warehouses?.data)) return [];
    return warehouses.data.map((item: any) => ({
      value: item.id,
      label: item.name,
    }));
  }, [warehouses]);

  const inventoryOptions = useMemo(() => {
    if (!Array.isArray(inventorySelector?.data)) return [];
    return inventorySelector.data.map((item: any) => ({
      value: item.inventory.id,
      label: `${item.inventory.name} - ${item.quantity} ${item.inventory.unit}`,
    }));
  }, [inventorySelector]);

  const destinationOptions = useMemo(
    () => warehouseOptions.filter((item) => item.value !== sourceWarehouseId),
    [warehouseOptions, sourceWarehouseId],
  );

  const isStep1Complete = !!sourceWarehouseId && !!type;

  const getQuantityLabel = () => {
    if (type === IAdjustmentType.stockIn)
      return t("adjustment.form.quantityAdd");
    if (type === IAdjustmentType.stockOut)
      return t("adjustment.form.quantityRemove");
    return t("adjustment.form.quantityTransfer");
  };

  const onFormSubmit = (values: AdjustmentFormValues) => {
    const payload = {
      ...values,
      items: values.items.map((it) => ({
        ...it,
        quantity: Math.abs(it.quantity),
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField
              name="type"
              control={control as any}
              label={t("adjustment.form.typeLabel")}
              placeholder={t("adjustment.form.selectType")}
              options={[
                {
                  value: IAdjustmentType.stockIn,
                  label: t("adjustment.types.stockIn"),
                },
                {
                  value: IAdjustmentType.stockOut,
                  label: t("adjustment.types.stockOut"),
                },
                {
                  value: IAdjustmentType.transfer,
                  label: t("adjustment.types.transfer"),
                },
              ]}
            />
            <SelectField
              name="warehouseId"
              control={control as any}
              label={t("adjustment.form.sourceWarehouse")}
              placeholder={t("adjustment.form.selectSource")}
              options={warehouseOptions}
            />
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
            onClick={() =>
              append({ inventoryId: "", quantity: 1, toWarehouseId: "" })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("adjustment.form.addItem")}
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {!isStep1Complete && (
            <div className="flex items-center justify-center py-8 text-center text-muted-foreground italic">
              {t("adjustment.form.selectSourceAndType")}
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="group flex flex-col gap-2 p-4 rounded-xl border bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-end gap-4 w-full">
                {/* Inventory Selection - 50% */}
                <div className="w-full sm:w-1/2">
                  <SelectField
                    name={`items.${index}.inventoryId`}
                    control={control as any}
                    label={t("adjustment.form.inventoryItem")}
                    placeholder={t("adjustment.form.selectItem")}
                    options={inventoryOptions}
                  />
                </div>

                {/* Quantity - 30% */}
                <div className="w-full sm:w-[30%]">
                  <NumericField
                    name={`items.${index}.quantity`}
                    control={control as any}
                    label={getQuantityLabel()}
                  />
                </div>

                {/* Delete Button - 20% */}
                <div className="w-full sm:w-[20%] flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="sm:hidden lg:inline">
                      {t("common.delete")}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Transfer Destination - Sliding/Flexible Row */}
              {type === IAdjustmentType.transfer && (
                <div className="pt-2 border-t border-dashed animate-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/2">
                      <SelectField
                        name={`items.${index}.toWarehouseId`}
                        control={control as any}
                        label={t("adjustment.form.toWarehouse")}
                        placeholder={t("adjustment.form.selectDest")}
                        options={destinationOptions}
                      />
                    </div>
                    {/* Spacer to keep alignment */}
                    <div className="hidden sm:block sm:w-[30%]" />
                    <div className="hidden sm:block sm:w-[20%]" />
                  </div>
                </div>
              )}
            </div>
          ))}

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
                  append({ inventoryId: "", quantity: 1, toWarehouseId: "" })
                }
              >
                {t("adjustment.form.addItem")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <SubmitButton
          title={submitLabel || (item ? t("common.update") : t("common.save"))}
          loading={isPending}
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
