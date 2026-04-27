"use client";

import React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoanTransactionForm from "@/components/forms/loan/LoanTransactionForm";
import { useLanguage } from "@/hooks/language.hook";
import { useFetchPartnersTranx } from "@/api/loan/api.loan";
import { useFetchPartnerById } from "@/api/partner/api.partner";
import { LoadingView, ErrorView } from "@/components/common/StateView";

export default function EditLoanTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const partnerId = params.id as string;
  const txId = searchParams.get("txId");

  const { data: partnerData, isLoading: loadingPartner } =
    useFetchPartnerById(partnerId);
  const {
    data: txData,
    isLoading: loadingTx,
    isError,
    refetch,
  } = useFetchPartnersTranx(txId!, !!txId);

  if (loadingPartner || loadingTx) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const partnerName = partnerData?.data?.name || "...";

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 md:p-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("loan.form.editTranx")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("loan.detail.tranx.editTranx")} {t("common.for")}{" "}
            <span className="font-semibold text-primary">{partnerName}</span>
          </p>
        </div>
      </div>

      <div className="p-6 bg-card rounded-2xl border shadow-sm">
        <LoanTransactionForm
          txId={txId || undefined}
          partnerId={partnerId}
          initialValues={txData?.data}
          onSuccess={() => router.push(`/loan/${partnerId}`)}
        />
      </div>
    </div>
  );
}
