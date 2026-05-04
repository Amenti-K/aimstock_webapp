"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/context/SubscriptionContext";
import { useFetchPlans } from "@/api/subscription/api.plan";
import {
  useCreateTrialSubscription,
} from "@/api/subscription/api.subscription";
import {
  BillingInterval,
  IPlan,
} from "@/components/interface/subscription/subscription.interface";
import {
  CheckCircle2,
  Gift,
  Loader2,
  LogOut,
  Rocket,
  Star,
  Zap,
} from "lucide-react";
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
    interval: BillingInterval
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
      amount
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
          : "border-border hover:border-primary/40"
      )}
      onClick={() => onSelect(plan.id, isRecommended, interval)}
    >
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wide shadow-md">
            <Star className="w-3 h-3 mr-1" />
            {t("plan.card.recommended")}
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
            {t("plan.card.keyFeatures")}
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
              {t("plan.card.moreFeatures", { count: features.length - 6 })}
            </p>
          )}
        </div>

        {/* CTA */}
        <Button
          variant={isRecommended ? "default" : "outline"}
          className="w-full"
          id={`select-plan-${plan.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(plan.id, isRecommended, interval);
          }}
        >
          {t("plan.card.selectPlan", { name: plan.name })}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlockedPlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [activeInterval, setActiveInterval] = useState<BillingInterval>(
    BillingInterval.YEARLY
  );

  const INTERVALS: {
    key: BillingInterval;
    label: string;
    badge?: string;
  }[] = useMemo(() => [
    { key: BillingInterval.THREE_MONTHS, label: t("subscription.plans.intervals.3months") },
    { key: BillingInterval.SIX_MONTHS, label: t("subscription.plans.intervals.6months") },
    { key: BillingInterval.YEARLY, label: t("subscription.plans.intervals.year"), badge: t("plan.tabs.save20") },
  ], [t]);

  const { subscription, isInitialized, loading: subLoading } = useSubscription();
  const { data: plansData, isLoading } = useFetchPlans();
  const plans = plansData?.data || [];

  // Find the first non-enterprise plan for the trial offer
  const starterPlan = plans.find((p) => !p.isEnterprise);

  const createTrial = useCreateTrialSubscription();

  // Only show trial if user has NEVER had any subscription
  const canTryTrial = isInitialized && !subLoading && subscription === null;

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

  const handleTryTrial = () => {
    if (!starterPlan) return;
    createTrial.mutate(
      { planId: starterPlan.id },
      { onSuccess: () => router.replace("/dashboard") }
    );
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">AIM Stock</span>
        </div>
        <Button
          id="blocked-plans-logout"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {t("common.confirmLogout.title")}
        </Button>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 w-full max-w-6xl mx-auto">
        {/* ── Page Title ── */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t("plan.choose")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("plan.chooseDes")}
          </p>
        </div>

        {/* ── Trial Banner ── */}
        {canTryTrial && starterPlan && (
          <div className="mb-10 rounded-2xl bg-primary/5 border border-primary/20 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Gift className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-foreground text-lg">
                {t("plan.trial.bannerTitle")}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {t("plan.trial.bannerDescription", { planName: starterPlan.name })}
              </p>
            </div>
            <Button
              id="start-trial-btn"
              size="lg"
              className="gap-2 flex-shrink-0 min-w-[180px]"
              onClick={handleTryTrial}
              disabled={createTrial.isPending || !starterPlan}
            >
              {createTrial.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              {createTrial.isPending ? t("common.loading") : t("plan.trial.startButton")}
            </Button>
          </div>
        )}

        {/* ── Interval Tabs ── */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 rounded-xl bg-muted p-1.5">
            {INTERVALS.map((int) => (
              <button
                key={int.key}
                id={`interval-tab-${int.key}`}
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
        </div>

        {/* Yearly savings note */}
        {activeInterval === BillingInterval.YEARLY && (
          <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-8">
            {t("plan.tabs.save20")}
          </p>
        )}

        {/* ── Plan Cards ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {t("plan.tabs.noPlans")}
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-6",
              filteredPlans.length === 1
                ? "max-w-sm mx-auto"
                : filteredPlans.length === 2
                  ? "sm:grid-cols-2 max-w-3xl mx-auto"
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
      </main>
    </div>
  );
}
