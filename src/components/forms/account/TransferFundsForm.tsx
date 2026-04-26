"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, TransferFormType } from "../../schema/account.schema";
import {
  IAccountTransfer,
  IAccountSelector,
} from "../../interface/interface.account";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRightLeft } from "lucide-react";
import NumericField from "../fields/NumericField";
import SelectField from "../fields/SelectField";
import { useLanguage } from "@/hooks/language.hook";

interface Props {
  fromAccountId: string;
  accounts: IAccountSelector[];
  onTransfer: (data: IAccountTransfer) => void;
  loading?: boolean;
}

export default function TransferFundsForm({
  fromAccountId,
  accounts,
  onTransfer,
  loading = false,
}: Props) {
  const { t } = useLanguage();
  
  const form = useForm<TransferFormType>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      toAccountId: "",
      amount: 0,
    },
  });

  const onSubmit = (formData: TransferFormType) => {
    onTransfer({
      fromAccountId,
      toAccountId: formData.toAccountId,
      amount: formData.amount,
    });
  };

  const otherAccounts = accounts.filter((acc) => acc.id !== fromAccountId);

  const accountOptions = otherAccounts.map((acc) => ({
    label: `${acc.name} (${Number(acc.balance).toLocaleString()} ETB)`,
    value: acc.id,
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-1">
        <div className="bg-primary/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-primary/10">
          <SelectField
            control={form.control as any}
            name="toAccountId"
            label={t("accounts.transfer.to")}
            placeholder={t("accounts.transfer.select")}
            options={accountOptions}
          />
        </div>

        <NumericField
          control={form.control as any}
          name="amount"
          label={t("accounts.transfer.amount")}
          placeholder="0.00"
          type="number"
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-5 sm:py-6 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 mt-2"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <ArrowRightLeft className="mr-2 h-5 w-5" />
          )}
          {t("accounts.transfer.transfer")}
        </Button>
      </form>
    </Form>
  );
}
