"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetchPlans } from "@/api/subscription/api.plan";
import {
  BillingInterval,
  IPlan,
} from "@/components/interface/subscription/subscription.interface";
import { ArrowLeft, CheckCircle2, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/language.hook";

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  interval,
  onSelect,
}: {
  plan: IPlan;
  interval: BillingInterval;
  onSelect: (
    planId: string,
    recommended: boolean,
    interval: BillingInterval,
  ) => void;
}) {
  const { t } = useLanguage();
  const priceObj = plan.prices.find((p) => p.interval === interval);
  const price = priceObj?.amount || 0;
  const currency = priceObj?.currency || "ETB";
  const isRecommended = plan.isEnterprise;
  const features = plan.features.filter((f) => f.enabled).map((f) => f.feature);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-ET", { minimumFractionDigits: 0 }).format(
      amount,
    );
  };

  const intervalLabel = useMemo(() => {
    if (interval === BillingInterval.THREE_MONTHS) return t("subscription.plans.intervals.3months");
    if (interval === BillingInterval.SIX_MONTHS) return t("subscription.plans.intervals.6months");
    return t("subscription.plans.intervals.year");
  }, [interval, t]);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border-2 bg-card transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        isRecommended
          ? "border-primary shadow-primary/20 shadow-lg"
          : "border-border hover:border-primary/40",
      )}
      onClick={() => onSelect(plan.id, isRecommended, interval)}
    >
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-md">
            <Star className="w-3 h-3 mr-1" />
            {t("subscription.plans.recommended")}
          </Badge>
        </div>
      )}

      <div className="p-6 flex flex-col flex-1 pt-8">
        {/* Name & Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
          {plan.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {plan.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-6">
          <span
            className={cn(
              "text-4xl font-extrabold",
              isRecommended ? "text-primary" : "text-foreground",
            )}
          >
            {formatPrice(price)}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {currency} / {intervalLabel}
          </span>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2.5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("subscription.plans.keyFeatures")}
          </p>
          {features.slice(0, 6).map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground capitalize">
                {feature.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
          ))}
          {features.length > 6 && (
            <p className="text-xs text-muted-foreground pl-6 mt-1">
              {t("subscription.plans.moreFeatures", { count: features.length - 6 })}
            </p>
          )}
        </div>

        {/* CTA */}
        <Button
          variant={isRecommended ? "default" : "outline"}
          className="w-full"
          id={`setting-select-plan-${plan.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plan.id, isRecommended, interval);
          }}
        >
          {t("subscription.plans.selectPlan", { name: plan.name })}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [activeInterval, setActiveInterval] = useState<BillingInterval>(
    BillingInterval.YEARLY,
  );

  const INTERVALS: { key: BillingInterval; label: string; badge?: string }[] = useMemo(() => [
    { key: BillingInterval.THREE_MONTHS, label: t("subscription.plans.intervals.3months") },
    { key: BillingInterval.SIX_MONTHS, label: t("subscription.plans.intervals.6months") },
    { key: BillingInterval.YEARLY, label: t("subscription.plans.intervals.year") },
  ], [t]);

  const { data: plansData, isLoading } = useFetchPlans();
  const plans = plansData?.data || [];

  const filteredPlans = plans.filter((plan) =>
    plan.prices.some((p) => p.interval === activeInterval),
  );

  const handleSelectPlan = (
    planId: string,
    recommended: boolean,
    interval: BillingInterval,
  ) => {
    router.push(
      `/setting/subscription/billing?planId=${planId}&interval=${interval}&recommended=${recommended}`,
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <div className="flex w-full items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight sm:text-4xl">
              {t("subscription.plans.title")}
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <p className="text-muted-foreground text-center max-w-lg mx-auto">
        {t("subscription.plans.description")}
      </p>

      {/* Interval Tabs */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-1 rounded-2xl bg-muted p-1.5 w-fit shadow-inner ring-1 ring-border">
          {INTERVALS.map((int) => (
            <button
              key={int.key}
              id={`setting-interval-${int.key}`}
              onClick={() => setActiveInterval(int.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all duration-300",
                activeInterval === int.key
                  ? "bg-background text-primary shadow-lg ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
            >
              {int.label}
              {int.badge && (
                <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black leading-none shadow-sm">
                  {int.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Yearly savings note */}
        {activeInterval === BillingInterval.YEARLY && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
            {t("subscription.plans.yearlySavings")}
          </p>
        )}
      </div>

      {/* Plan Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border">
          <p className="text-muted-foreground font-medium">
            {t("subscription.plans.noPlans")}
          </p>
        </div>
      ) : (
        <div className="flex justify-center w-full">
          <div
            className={cn(
              "grid gap-8 w-full",
              filteredPlans.length === 1
                ? "max-w-sm"
                : filteredPlans.length === 2
                  ? "sm:grid-cols-2 max-w-4xl"
                  : "sm:grid-cols-2 lg:grid-cols-3 max-w-6xl",
            )}
          >
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={activeInterval}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
