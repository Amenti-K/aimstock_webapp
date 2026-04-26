"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateAccount } from "@/api/account/api.account";
import { useLanguage } from "@/hooks/language.hook";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AccountForm from "@/components/forms/account/AccountForm";
import { motion } from "motion/react";

export default function NewAccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const createAccount = useCreateAccount();

  const handleCreate = (formData: any) => {
    createAccount.mutate(formData, {
      onSuccess: () => {
        router.push("/account");
      },
    });
  };

  return (
    <div className="max-w-2xl px-4 ">
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
              {t("accounts.form.add")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("accounts.form.addSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <AccountForm onSave={handleCreate} loading={createAccount.isPending} />
      </div>
    </div>
  );
}
