"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/components/forms/fields/TextField";
import { Button } from "@/components/ui/button";
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "./employee.schema";
import { useLanguage } from "@/hooks/language.hook";

interface EmployeeResetPasswordFormProps {
  onSubmit: (values: ResetPasswordFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function EmployeeResetPasswordForm({
  onSubmit,
  onCancel,
  isPending = false,
}: EmployeeResetPasswordFormProps) {
  const { t } = useLanguage();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        name="password"
        control={form.control as any}
        label={t("employee.form.newPass")}
        placeholder="********"
        secureTextEntry
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? t("common.loading") : t("employee.form.resetPass")}
        </Button>
      </div>
    </form>
  );
}
