"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import TextField from "@/components/forms/fields/TextField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SwitchField from "@/components/forms/fields/SwitchField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { Button } from "@/components/ui/button";
import { WarehouseFormValues, warehouseSchema } from "./warehouse.schema";

interface Props {
  initialData?: Partial<WarehouseFormValues> | null;
  onSubmit: (values: WarehouseFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function WarehouseForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = "Save",
}: Props) {
  const { control, handleSubmit, reset } = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      location: "",
      contactPhone: "",
      description: "",
      isInternal: false,
    },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      name: initialData.name ?? "",
      location: initialData.location ?? "",
      contactPhone: initialData.contactPhone ?? "",
      description: initialData.description ?? "",
      isInternal: initialData.isInternal ?? false,
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField name="name" control={control} label="Name" placeholder="Warehouse name" />
      <TextField name="location" control={control} label="Location" placeholder="Location" />
      <TextField
        name="contactPhone"
        control={control}
        label="Contact Phone"
        placeholder="0911xxxxxx"
      />
      <SwitchField name="isInternal" control={control} label="Internal warehouse" />
      <TextAreaField
        name="description"
        control={control}
        label="Description"
        placeholder="Optional description"
      />
      <div className="flex gap-3">
        <SubmitButton title={submitLabel} loading={isPending} />
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
