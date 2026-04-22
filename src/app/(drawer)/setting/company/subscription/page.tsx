"use client";

import React, { useMemo } from "react";
import { useSubscription } from "@/context/SubscriptionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, Clock3, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatter";

export default function SubscriptionPage() {
  const router = useRouter();
  const {
    subscription,
    isActive,
    isTrialing,
    isPastDue,
    isExpired,
    daysLeft,
  } = useSubscription();

  const statusMeta = useMemo(() => {
    if (isActive) {
      return {
        label: "Active",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    }
    if (isTrialing) {
      return {
        label: "Trialing",
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
        style: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    }
    if (isPastDue) {
      return {
        label: "Past Due",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }

    return {
      label: "Inactive",
      icon: <Clock3 className="h-4 w-4 text-muted-foreground" />,
      style: "border-border bg-muted text-muted-foreground",
    };
  }, [isActive, isTrialing, isPastDue, isExpired]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Subscription Plan</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Plan Details
          </CardTitle>
          <CardDescription>
            Structured plan, status, cycle, and usage section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`flex items-center justify-between rounded-lg border p-3 ${statusMeta.style}`}>
            <div className="flex items-center gap-2">
              {statusMeta.icon}
              <span className="text-sm font-semibold">{statusMeta.label}</span>
            </div>
            <Badge variant="secondary">{subscription?.plan?.name ?? "No Plan"}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Current Period Start</p>
              <p className="text-sm font-semibold">
                {subscription?.currentPeriodStart
                  ? formatDate(subscription.currentPeriodStart)
                  : "-"}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Current Period End</p>
              <p className="text-sm font-semibold">
                {subscription?.currentPeriodEnd
                  ? formatDate(subscription.currentPeriodEnd)
                  : subscription?.trialEndsAt
                    ? formatDate(subscription.trialEndsAt)
                    : "-"}
              </p>
            </div>
          </div>

          {typeof daysLeft === "number" && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-center">
              <span className="font-bold">{daysLeft}</span> days remaining in current cycle.
            </div>
          )}

          <div className="space-y-2 rounded-lg border p-3">
            <p className="text-sm font-medium">Plan Features</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {subscription?.plan?.features?.filter((feature) => feature.enabled).length ? (
                subscription?.plan?.features
                  ?.filter((feature) => feature.enabled)
                  .map((feature) => (
                    <li key={feature.feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {feature.feature}
                    </li>
                  ))
              ) : (
                <li>No feature metadata available</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full">Change Plan</Button>
            <Button variant="outline" className="w-full">Billing Instructions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
