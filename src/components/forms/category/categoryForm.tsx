"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextField from "@/components/forms/fields/TextField";
import TextAreaField from "@/components/forms/fields/TextAreaField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { Button } from "@/components/ui/button";
import {
  InventoryCategoryFormValues,
  InventoryCategorySchema,
} from "@/components/schema/inventory.schema";

interface Props {
  initialData?: Partial<InventoryCategoryFormValues> | null;
  onSubmit: (values: InventoryCategoryFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<InventoryCategoryFormValues>(
    {
      resolver: zodResolver(InventoryCategorySchema),
      defaultValues: { name: "", description: "" },
    },
  );

  useEffect(() => {
    if (!initialData) return;
    reset({
      name: initialData.name ?? "",
      description: initialData.description ?? "",
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        name="name"
        control={control as any}
        label={t("inventory.form.category.name")}
        placeholder={t("inventory.form.category.namePlaceholder")}
      />
      <TextAreaField
        name="description"
        control={control as any}
        label={t("inventory.form.category.description")}
        placeholder={t("inventory.form.category.descriptionPlaceholder")}
      />
      <div className="flex justify-between  gap-3">
        <div className="w-full flex-1">
          <SubmitButton
            title={submitLabel || t("common.save")}
            loading={isPending}
          />
        </div>
        <div className="w-full flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </form>
  );
}
