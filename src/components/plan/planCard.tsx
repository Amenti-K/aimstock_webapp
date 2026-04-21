import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BillingInterval,
  IPlan,
  PlanPrice,
} from "@/components/interface/subscription/subscription.interface";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, LayoutDashboard } from "lucide-react";

interface PlanCardProps {
  plan: IPlan;
  onClick: (plan: IPlan) => void;
}

export default function PlanCard({ plan, onClick }: PlanCardProps) {
  // Helper to format price
  const formatPrice = (price?: PlanPrice) => {
    if (!price) return "N/A";
    const amount = new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: price.currency,
    }).format(price.amount);
    const interval =
      price.interval === BillingInterval.MONTHLY
        ? "mo"
        : price.interval === BillingInterval.YEARLY
          ? "yr"
          : "unit";
    return `${amount} / ${interval}`;
  };

  // Find a representative price (e.g., Monthly or first available)
  const displayPrice =
    plan.prices.find((p) => p.interval === BillingInterval.MONTHLY) ||
    plan.prices[0];

  return (
    <Card
      className="flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
      onClick={() => onClick(plan)}
    >
      {plan.isEnterprise && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
          Enterprise
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{plan.name}</CardTitle>
            <CardDescription className="line-clamp-2 min-h-[40px]">
              {plan.description || "No description provided."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {/* Price Tag */}
        <div className="text-2xl font-bold">
          {displayPrice ? (
            formatPrice(displayPrice)
          ) : (
            <span className="text-muted-foreground text-lg">Contact Sales</span>
          )}
        </div>

        {/* Quick Stats / Features Summary */}
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span>
              {plan.features.filter((f) => f.enabled).length} Features
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            <span>{plan.limits.length} Limits</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full group">
          View Details
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
