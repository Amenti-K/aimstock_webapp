"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, AccountFormData } from "../../schema/account.schema";
import { EthiopianFinancialInstitutionArray } from "../../interface/interface.account";
import TextField from "@/components/forms/fields/TextField";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";

interface Props {
  data?: Partial<AccountFormData>;
  onSave: (data: AccountFormData) => void;
  mode?: "add" | "edit";
  loading?: boolean;
}

export default function AccountForm({
  data,
  onSave,
  mode = "add",
  loading = false,
}: Props) {
  const { t } = useLanguage();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: data?.name ?? "",
      bank: data?.bank,
      branch: data?.branch ?? "",
      number: data?.number ?? "",
      balance: Number(data?.balance ?? 0),
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        bank: data.bank,
        branch: data.branch ?? "",
        number: data.number ?? "",
        balance: Number(data.balance ?? 0),
      });
    }
  }, [data, form]);

  const onSubmit = (formData: AccountFormData) => {
    onSave(mode === "edit" ? { ...formData, id: data?.id } : formData);
  };

  // Translate bank options
  const translatedBanks = EthiopianFinancialInstitutionArray.map((bank) => ({
    label: t(`accounts.bank.${bank.value}`),
    value: bank.value,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-1">
        <div className="bg-muted/30 p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 border border-muted-foreground/10">
          <TextField
            control={form.control as any}
            name="name"
            label={t("accounts.form.name")}
            placeholder={t("accounts.form.name")}
          />

          <SelectField
            control={form.control as any}
            name="bank"
            label={t("accounts.form.bank")}
            placeholder={t("accounts.form.select")}
            options={translatedBanks}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <TextField
            control={form.control as any}
            name="branch"
            label={t("accounts.form.branch")}
            placeholder="Piassa"
          />

          <TextField
            control={form.control as any}
            name="number"
            label={t("accounts.form.number")}
            placeholder="1000..."
          />
        </div>

        <NumericField
          control={form.control as any}
          name="balance"
          label={
            mode === "add"
              ? t("accounts.form.balance")
              : t("accounts.form.balanceEdit")
          }
          placeholder="0.00"
          type="number"
          disabled={mode === "edit"}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-5 sm:py-6 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 mt-2"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {mode === "edit" ? t("accounts.form.edit") : t("accounts.form.add")}
        </Button>
      </form>
    </Form>
  );
}
