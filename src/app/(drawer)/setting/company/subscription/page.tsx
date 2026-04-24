"use client";

import React, { useMemo } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Zap,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatter";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const router = useRouter();
  const {
    subscription,
    isActive,
    isTrialing,
    isPastDue,
    isExpired,
    daysLeft,
    loading,
  } = useSubscription();

  const statusMeta = useMemo(() => {
    if (isActive) {
      return {
        label: "Active",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        style:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    }
    if (isTrialing) {
      return {
        label: "Trialing",
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
        style:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    }
    if (isPastDue) {
      return {
        label: "Past Due",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style:
          "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }

    return {
      label: "Inactive",
      icon: <Clock3 className="h-4 w-4 text-muted-foreground" />,
      style: "border-border bg-muted text-muted-foreground",
    };
  }, [isActive, isTrialing, isPastDue, isExpired]);

  const usagesWithLimits = useMemo(() => {
    if (!subscription?.usages || !subscription?.plan?.limits) return [];

    return subscription.plan.limits.map((limit) => {
      const usage = subscription.usages.find((u) => u.metric === limit.metric);
      return {
        ...usage,
        limit: limit?.value ?? null,
        metric: limit.metric,
      };
    });
  }, [subscription]);

  // Only show usage card if there's at least one metric with a finite limit
  const hasFiniteLimits = useMemo(() => {
    return usagesWithLimits.some((u) => u.limit !== null);
  }, [usagesWithLimits]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your plan, usage, and billing.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-1">
        {/* 1. Subscription Overview Card */}
        <Card className="overflow-hidden border-none shadow-lg ring-1 ring-border">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Plan Overview
                </CardTitle>
                <CardDescription>
                  Your current subscription status and period.
                </CardDescription>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border px-4 py-1.5 transition-all",
                  statusMeta.style,
                )}
              >
                {statusMeta.icon}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {statusMeta.label}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  Current Plan
                </p>
                <h3 className="text-3xl font-black text-primary">
                  {subscription?.plan?.name ?? "No Plan"}
                </h3>
                <p className="text-muted-foreground">
                  {subscription?.plan?.description ?? "No description"}
                </p>
              </div>
              <div className="flex flex-wrap w-[65%] gap-4">
                <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      Period Ends
                    </p>
                    <p className="text-sm font-bold">
                      {subscription?.currentPeriodEnd
                        ? formatDate(subscription.currentPeriodEnd)
                        : subscription?.trialEndsAt
                          ? formatDate(subscription.trialEndsAt)
                          : "N/A"}
                    </p>
                  </div>
                </div>
                {daysLeft !== undefined &&
                  (isActive || isTrialing || isPastDue) && (
                    <div className="flex items-center gap-3 rounded-xl border bg-primary/5 p-4 shadow-sm">
                      <Clock3 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase">
                          Days Remaining
                        </p>
                        <p className="text-sm font-bold">{daysLeft} Days</p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button
                className="flex-1 h-12 text-sm font-bold uppercase tracking-wider rounded-xl"
                onClick={() => router.push("/setting/subscription/plans")}
              >
                <Zap className="mr-2 h-4 w-4 fill-current" />
                Change / Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Resource Usage Card */}
        {hasFiniteLimits && (
          <Card className="border-none shadow-md ring-1 ring-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="h-5 w-5 text-primary" />
                Resource Usage
              </CardTitle>
              <CardDescription>
                Track your feature utilization against plan limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              {usagesWithLimits.map((usage, idx) => {
                const limit = usage.limit;
                const isUnlimited = limit === null;
                const progress =
                  !isUnlimited && typeof limit === "number"
                    ? Math.min(Math.max((usage?.value || 0) / limit, 0), 1)
                    : 0;

                const progressColor =
                  progress > 0.9
                    ? "bg-rose-500"
                    : progress > 0.7
                      ? "bg-amber-500"
                      : "bg-primary";

                return (
                  <div
                    key={idx}
                    className="group relative flex flex-col gap-3 rounded-2xl border bg-card p-5 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                        {usage.metric.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-black">
                        {usage.value || 0} /{" "}
                        <span className="text-muted-foreground">
                          {isUnlimited ? "∞" : limit}
                        </span>
                      </span>
                    </div>

                    {!isUnlimited && (
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 ease-out",
                            progressColor,
                          )}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 3. Plan Features Card */}
        <Card className="border-none shadow-md ring-1 ring-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Included Features
            </CardTitle>
            <CardDescription>
              A complete list of modules and tools active on your plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subscription?.plan?.features
                ?.filter((f) => f.enabled)
                .map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-tight text-foreground/80">
                      {f.feature.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
            </div>
            {(!subscription?.plan?.features ||
              subscription.plan.features.filter((f) => f.enabled).length ===
                0) && (
              <p className="text-center py-6 text-sm text-muted-foreground italic">
                No features are explicitly listed for this plan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
