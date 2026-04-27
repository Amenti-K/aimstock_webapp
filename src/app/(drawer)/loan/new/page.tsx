"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoanInitialForm from "@/components/forms/loan/LoanInitialForm";
import { useLanguage } from "@/hooks/language.hook";

export default function NewLoanPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 md:p-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("loan.form.addLoan")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("loan.form.initialLoanTranx")}
          </p>
        </div>
      </div>

      <div className="p-6 bg-card rounded-2xl border shadow-sm">
        <LoanInitialForm
          onSuccess={() => router.push("/loan")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
