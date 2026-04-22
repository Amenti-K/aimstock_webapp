"use client";

import React, { Suspense, useState } from "react";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-ET", { minimumFractionDigits: 0 }).format(
    amount
  );
}

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  [BillingInterval.MONTHLY]: "Monthly",
  [BillingInterval.THREE_MONTHS]: "3 Months",
  [BillingInterval.SIX_MONTHS]: "6 Months",
  [BillingInterval.YEARLY]: "Yearly",
};

// ─── Inner component (needs useSearchParams) ──────────────────────────────────

function BillingContent() {
  const router = useRouter();
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
          Back
        </Button>
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="text-muted-foreground">
            Plan not found. Please go back and select a plan.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
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
            Billing &amp; Payment
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your subscription payment below
          </p>
        </div>
      </div>

      {/* ── Order Summary ── */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-base">Order Summary</h2>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedPlan!.name} Plan
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
          <span className="font-bold text-base">Total Due</span>
          <span className="font-extrabold text-2xl text-primary">
            {currency} {formatPrice(price)}
          </span>
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="space-y-4">
        <h2 className="font-semibold text-base">Payment Method</h2>

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
            Transfer the exact amount to the following account:
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
            Tap the account number to select and copy it
          </p>
        </div>
      </div>

      {/* ── Instructions ── */}
      <div className="rounded-xl bg-secondary/40 border border-secondary/60 p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-secondary-foreground" />
          <p className="font-semibold text-secondary-foreground text-sm">
            Payment Instructions
          </p>
        </div>
        <p className="text-sm text-secondary-foreground/90">
          1. Transfer the exact amount shown above to the account number
          provided.
        </p>
        <p className="text-sm text-secondary-foreground/90">
          2. Take a screenshot or photo of your payment receipt / confirmation.
        </p>
        <p className="text-sm text-secondary-foreground/90">
          3. Send the receipt to our support team via Telegram for manual
          verification and activation.
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
        Send Payment Receipt to Support
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
