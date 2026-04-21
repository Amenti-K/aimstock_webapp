"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";
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
  AdjustmentType,
  adjustmentSchema,
} from "./adjustment.schema";

interface Props {
  initialData?: Partial<AdjustmentFormValues> | null;
  onSubmit: (values: AdjustmentFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function AdjustmentForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Save",
}: Props) {
  const { control, handleSubmit, reset } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: { warehouseId: "", type: AdjustmentType.STOCK_IN, note: "", items: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const sourceWarehouseId = useWatch({ control, name: "warehouseId" });
  const type = useWatch({ control, name: "type" });
  const { data: warehouses } = useFetchWarehouseSelector();
  const { data: inventorySelector } = useFetchWarehouseInventorySelector(sourceWarehouseId || "", !!sourceWarehouseId);

  useEffect(() => {
    if (!initialData) return;
    reset({
      warehouseId: initialData.warehouseId ?? "",
      type: (initialData.type as AdjustmentType) ?? AdjustmentType.STOCK_IN,
      note: initialData.note ?? "",
      items: initialData.items ?? [],
    });
  }, [initialData, reset]);

  const warehouseOptions = useMemo(() => {
    if (!Array.isArray(warehouses?.data)) return [];
    return warehouses.data.map((item: any) => ({ value: item.id, label: item.name }));
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md border p-4 space-y-4">
        <h3 className="font-semibold">Step 1: Basic Information</h3>
        <SelectField name="type" control={control} label="Adjustment type" options={[
          { value: AdjustmentType.STOCK_IN, label: "Stock In" },
          { value: AdjustmentType.STOCK_OUT, label: "Stock Out" },
          { value: AdjustmentType.TRANSFER, label: "Transfer" },
        ]} />
        <SelectField name="warehouseId" control={control} label="Source warehouse" options={warehouseOptions} />
        <TextAreaField name="note" control={control} label="Note" placeholder="Optional note" />
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Step 2: Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ inventoryId: "", quantity: 0, toWarehouseId: "" })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add item
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 gap-3 rounded-md border p-3 md:grid-cols-[1fr_160px_1fr_44px]">
            <SelectField name={`items.${index}.inventoryId`} control={control} label="Inventory" options={inventoryOptions} />
            <NumericField name={`items.${index}.quantity`} control={control} label="Qty" />
            {type === AdjustmentType.TRANSFER ? (
              <SelectField name={`items.${index}.toWarehouseId`} control={control} label="Destination" options={destinationOptions} />
            ) : (
              <div />
            )}
            <Button type="button" variant="destructive" size="icon" className="mt-8" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <SubmitButton title={submitLabel} loading={isPending} />
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
