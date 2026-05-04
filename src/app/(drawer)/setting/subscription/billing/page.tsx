"use client";

import React, { Suspense, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetchPlans } from "@/api/subscription/api.plan";
import {
  BillingInterval,
} from "@/components/interface/subscription/subscription.interface";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BANK_DETAILS, SUPPORT_LINKS } from "@/lib/billing";
import type { BankKey } from "@/lib/billing";
import {
  Banknote,
  ChevronLeft,
  Info,
  Loader2,
  Phone,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/language.hook";

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function BillingContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const planId = searchParams.get("planId") ?? "";
  const interval =
    (searchParams.get("interval") as BillingInterval) ?? BillingInterval.YEARLY;

  const { data: plansData, isLoading, isError } = useFetchPlans();
  const plans = plansData?.data || [];
  const selectedPlan = plans.find((p) => p.id === planId);
  const priceObj = selectedPlan?.prices.find((p) => p.interval === interval);
  const price = priceObj?.amount || 0;
  const currency = priceObj?.currency || "ETB";

  const [activeBank, setActiveBank] = useState<BankKey>("CBE");

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-ET", { minimumFractionDigits: 0 }).format(
      amount
    );
  };

  const INTERVAL_LABELS: Record<BillingInterval, string> = useMemo(() => ({
    [BillingInterval.MONTHLY]: t("common.timeFrame.30days"),
    [BillingInterval.THREE_MONTHS]: t("subscription.plans.intervals.3months"),
    [BillingInterval.SIX_MONTHS]: t("subscription.plans.intervals.6months"),
    [BillingInterval.YEARLY]: t("subscription.plans.intervals.year"),
  }), [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || (!isLoading && !selectedPlan)) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          {t("common.back")}
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="text-muted-foreground">
            {t("subscription.billing.notFound")}
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button
          id="billing-back-btn"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("subscription.billing.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subscription.billing.description")}
          </p>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">{t("subscription.billing.orderSummary")}</h2>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("subscription.billing.planLabel", { name: selectedPlan!.name })}
          </span>
          <span className="font-semibold">
            {currency} {formatPrice(price)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Billing Cycle</span>
          <span>{INTERVAL_LABELS[interval]}</span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-bold text-base">{t("subscription.billing.totalDue")}</span>
          <span className="font-extrabold text-2xl text-primary">
            {currency} {formatPrice(price)}
          </span>
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="space-y-4">
        <h2 className="font-semibold text-base">{t("subscription.billing.paymentMethod")}</h2>

        {/* Bank Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted p-1.5">
          {(Object.keys(BANK_DETAILS) as BankKey[]).map((key) => {
            const bank = BANK_DETAILS[key];
            const isActive = activeBank === key;
            return (
              <button
                key={key}
                id={`bank-tab-${key}`}
                onClick={() => setActiveBank(key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {bank.type === "mobile" ? (
                  <Phone className="w-4 h-4" />
                ) : (
                  <Banknote className="w-4 h-4" />
                )}
                {key === "TELE" ? "Telebirr" : key}
              </button>
            );
          })}
        </div>

        {/* Account Details */}
        <div className="rounded-xl border bg-card p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("subscription.billing.transferInstructions")}
          </p>
          <p className="font-bold text-primary text-lg">
            {BANK_DETAILS[activeBank].name}
          </p>
          <p className="text-muted-foreground text-sm">
            {BANK_DETAILS[activeBank].accountName}
          </p>
          <div className="inline-block bg-muted rounded-xl px-6 py-3 mt-1">
            <p
              className="font-mono text-2xl font-bold tracking-widest select-all"
              id="billing-account-number"
            >
              {BANK_DETAILS[activeBank].accountNumber}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("subscription.billing.copyHint")}
          </p>
        </div>
      </div>

      {/* ── Instructions ── */}
      <div className="rounded-xl bg-secondary/40 border border-secondary/60 p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-secondary-foreground" />
          <p className="font-semibold text-secondary-foreground text-sm">
            {t("subscription.billing.instructions.title")}
          </p>
        </div>
        <p className="text-sm text-secondary-foreground/90">
          {t("subscription.billing.instructions.step1")}
        </p>
        <p className="text-sm text-secondary-foreground/90">
          {t("subscription.billing.instructions.step2")}
        </p>
        <p className="text-sm text-secondary-foreground/90">
          {t("subscription.billing.instructions.step3")}
        </p>
      </div>

      {/* ── Contact Support CTA ── */}
      <Button
        id="billing-send-receipt"
        size="lg"
        className="w-full gap-2"
        onClick={() => window.open(SUPPORT_LINKS.telegram, "_blank")}
      >
        <Send className="w-4 h-4" />
        {t("subscription.billing.sendReceipt")}
      </Button>
    </div>
  );
}

// ─── Page (wraps in Suspense for useSearchParams) ─────────────────────────────

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
