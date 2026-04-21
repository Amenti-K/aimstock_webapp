"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  submitLabel = "Save",
}: Props) {
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
      <TextField name="name" control={control} label="Name" placeholder="Partner name" />
      <TextField name="phone" control={control} label="Phone" placeholder="Phone number" />
      <TextField name="address" control={control} label="Address" placeholder="Address" />
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
