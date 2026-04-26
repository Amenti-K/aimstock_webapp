"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextField from "@/components/forms/fields/TextField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SwitchField from "@/components/forms/fields/SwitchField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { Button } from "@/components/ui/button";
import { WarehouseFormValues, warehouseSchema } from "./warehouse.schema";
import { IWarehouse } from "@/components/interface/warehouse/warehouse.interface";

interface Props {
  initialData?: Partial<IWarehouse> | null;
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
  const { t } = useTranslation();
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
      <TextField
        name="name"
        control={control as any}
        label={t("warehouse.form.name")}
        placeholder={t("warehouse.form.name")}
      />
      <TextField
        name="location"
        control={control as any}
        label={t("warehouse.form.location")}
        placeholder={t("warehouse.form.location")}
      />
      <TextField
        name="contactPhone"
        control={control as any}
        label={t("warehouse.form.contactPhone")}
        placeholder="0911xxxxxx"
      />
      <SwitchField
        name="isInternal"
        control={control as any}
        label={t("warehouse.form.isInternal")}
      />
      <TextAreaField
        name="description"
        control={control as any}
        label={t("warehouse.form.description")}
        placeholder={t("warehouse.form.description")}
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
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
