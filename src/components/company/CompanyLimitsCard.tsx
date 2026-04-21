import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ISubscription,
  IUsage,
  PlanLimit,
} from "@/components/interface/subscription/subscription.interface";

interface CompanyLimitsCardProps {
  subscription: ISubscription | null | undefined;
  usages: IUsage[] | null | undefined;
}

export const CompanyLimitsCard = ({
  subscription,
  usages,
}: CompanyLimitsCardProps) => {
  if (!subscription?.plan.limits) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Limits & Usage</CardTitle>
        <CardDescription>Current usage against plan limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscription.plan.limits.map((limit: PlanLimit) => {
            const usage = usages?.find(
              (u: IUsage) => u.metric === limit.metric
            );
            const usageValue = usage?.value || 0;
            const limitValue = limit.value;
            const percentage = limitValue ? (usageValue / limitValue) * 100 : 0;

            return (
              <div key={limit.metric} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">
                    {limit.metric.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="font-medium">
                    {usageValue} / {limitValue || "∞"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
