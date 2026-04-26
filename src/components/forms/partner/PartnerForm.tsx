"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import TextField from "@/components/forms/fields/TextField";
import SubmitButton from "@/components/forms/fields/SubmitButton";
import { Button } from "@/components/ui/button";
import { PartnerFormValues, partnerSchema } from "./partner.schema";

interface Props {
  initialData?: Partial<PartnerFormValues> | null;
  onSubmit: (values: PartnerFormValues) => void;
  onCancel?: () => void;
  isPending?: boolean;
  submitLabel?: string;
}

export default function PartnerForm({
  initialData,
  onSubmit,
  onCancel,
  isPending,
  submitLabel,
}: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: { name: "", phone: "", address: "" },
  });

  useEffect(() => {
    if (!initialData) return;
    reset({
      name: initialData.name ?? "",
      phone: initialData.phone ?? "",
      address: initialData.address ?? "",
    });
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        name="name"
        control={control as any}
        label={t("partners.form.name")}
        placeholder={t("partners.form.name")}
      />
      <TextField
        name="phone"
        control={control as any}
        label={t("partners.form.phoneNum")}
        placeholder="0911xxxxxx"
      />
      <TextField
        name="address"
        control={control as any}
        label={t("partners.form.address")}
        placeholder={t("partners.form.address")}
      />
      <div className="flex gap-3">
        <SubmitButton
          title={submitLabel || t("common.save")}
          loading={isPending}
        />
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
