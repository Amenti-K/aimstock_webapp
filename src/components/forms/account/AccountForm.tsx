"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema, AccountFormData } from "../../schema/account.schema";
import {
  EthiopianFinancialInstitutionArray,
} from "../../interface/interface.account";
import TextField from "@/components/forms/fields/TextField";
import SelectField from "@/components/forms/fields/SelectField";
import NumericField from "@/components/forms/fields/NumericField";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Wallet, Building, Info } from "lucide-react";

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
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: data?.name ?? "",
      bank: data?.bank,
      branch: data?.branch ?? "",
      number: data?.number ?? "",
      balance: Number(data?.balance) ?? 0,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? "",
        bank: data.bank,
        branch: data.branch ?? "",
        number: data.number ?? "",
        balance: Number(data.balance) ?? 0,
      });
    }
  }, [data, form]);

  const onSubmit = (formData: AccountFormData) => {
    onSave(mode === "edit" ? { ...formData, id: data?.id } : formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-2">
        <div className="bg-muted/30 p-4 rounded-2xl space-y-4 border border-muted-foreground/10">
          <TextField
            control={form.control}
            name="name"
            label="Account Name"
            placeholder="e.g. CBE Saving"
          />

          <SelectField
            control={form.control}
            name="bank"
            label="Bank / Institution"
            placeholder="Select bank"
            options={EthiopianFinancialInstitutionArray}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="branch"
            label="Branch"
            placeholder="Piassa"
          />

          <TextField
            control={form.control}
            name="number"
            label="Account Number"
            placeholder="1000..."
          />
        </div>

        <NumericField
          control={form.control}
          name="balance"
          label={mode === "add" ? "Starting Balance" : "Current Balance (Locked)"}
          placeholder="0.00"
          type="number"
          disabled={mode === "edit"}
        />

        <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5">
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {mode === "edit" ? "Update Account Details" : "Create New Account"}
        </Button>
      </form>
    </Form>
  );
}
