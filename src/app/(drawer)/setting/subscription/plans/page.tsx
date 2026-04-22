"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFetchPlans } from "@/api/subscription/api.plan";
import {
  BillingInterval,
  IPlan,
} from "@/components/interface/subscription/subscription.interface";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVALS: { key: BillingInterval; label: string; badge?: string }[] = [
  { key: BillingInterval.THREE_MONTHS, label: "3 Months" },
  { key: BillingInterval.SIX_MONTHS, label: "6 Months" },
  { key: BillingInterval.YEARLY, label: "1 Year", badge: "Save 20%" },
];

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-ET", { minimumFractionDigits: 0 }).format(
    amount
  );
}

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
    interval: BillingInterval
  ) => void;
}) {
  const priceObj = plan.prices.find((p) => p.interval === interval);
  const price = priceObj?.amount || 0;
  const currency = priceObj?.currency || "ETB";
  const isRecommended = plan.isEnterprise;
  const features = plan.features.filter((f) => f.enabled).map((f) => f.feature);

  const intervalLabel =
    interval === BillingInterval.THREE_MONTHS
      ? "3 months"
      : interval === BillingInterval.SIX_MONTHS
        ? "6 months"
        : "year";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border-2 bg-card transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        isRecommended
          ? "border-primary shadow-primary/20 shadow-lg"
          : "border-border hover:border-primary/40"
      )}
      onClick={() => onSelect(plan.id, isRecommended, interval)}
    >
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-md">
            <Star className="w-3 h-3 mr-1" />
            Recommended
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
              isRecommended ? "text-primary" : "text-foreground"
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
            Key Features
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
              +{features.length - 6} more features
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
          Select {plan.name}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * setting/subscription/plans — plan chooser for EXISTING users (renewal).
 * Lives inside the drawer, so it has the full sidebar + header.
 * No trial banner (they already had a subscription).
 * Selecting a plan routes to setting/subscription/billing.
 */
export default function SubscriptionPlansPage() {
  const router = useRouter();
  const [activeInterval, setActiveInterval] = useState<BillingInterval>(
    BillingInterval.YEARLY
  );

  const { data: plansData, isLoading } = useFetchPlans();
  const plans = plansData?.data || [];

  const filteredPlans = plans.filter((plan) =>
    plan.prices.some((p) => p.interval === activeInterval)
  );

  const handleSelectPlan = (
    planId: string,
    recommended: boolean,
    interval: BillingInterval
  ) => {
    router.push(
      `/setting/subscription/billing?planId=${planId}&interval=${interval}&recommended=${recommended}`
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a plan to renew or upgrade your subscription.
        </p>
      </div>

      {/* Interval Tabs */}
      <div className="flex items-center gap-1 rounded-xl bg-muted p-1.5 w-fit">
        {INTERVALS.map((int) => (
          <button
            key={int.key}
            id={`setting-interval-${int.key}`}
            onClick={() => setActiveInterval(int.key)}
            className={cn(
              "relative flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200",
              activeInterval === int.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {int.label}
            {int.badge && (
              <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                {int.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Yearly savings note */}
      {activeInterval === BillingInterval.YEARLY && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
          🎉 Save up to 20% compared to 3-month billing
        </p>
      )}

      {/* Plan Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          No plans available for this billing period.
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6 pt-2",
            filteredPlans.length === 1
              ? "max-w-sm"
              : filteredPlans.length === 2
                ? "sm:grid-cols-2 max-w-3xl"
                : "sm:grid-cols-2 lg:grid-cols-3"
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
      )}
    </div>
  );
}
