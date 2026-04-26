"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetAccount, useUpdateAccount } from "@/api/account/api.account";
import { useLanguage } from "@/hooks/language.hook";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountForm from "@/components/forms/account/AccountForm";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { motion } from "motion/react";

export default function EditAccountPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const {
    data: accountData,
    isLoading,
    isError,
    refetch,
  } = useGetAccount(id as string);
  const updateAccount = useUpdateAccount();

  if (isLoading) return <LoadingView />;
  if (isError || !accountData?.data) return <ErrorView refetch={refetch} />;

  const account = accountData.data;

  const handleUpdate = (formData: any) => {
    updateAccount.mutate(formData, {
      onSuccess: () => {
        router.push(`/account/${id}`);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 rounded-full hover:bg-background"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common:back")}
        </Button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Landmark className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t("accounts.form.edit")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("accounts.form.editSubtitle", { name: account.name })}
            </p>
          </div>
        </div>
      </div>

      <div>
        <AccountForm
          mode="edit"
          data={account}
          onSave={handleUpdate}
          loading={updateAccount.isPending}
        />
      </div>
    </div>
  );
}
