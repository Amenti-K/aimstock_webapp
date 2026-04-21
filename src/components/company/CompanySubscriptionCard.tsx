import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Clock, Calendar } from "lucide-react";
import { formatDate } from "@/lib/formatter";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { ISubscription } from "@/components/interface/subscription/subscription.interface";

interface CompanySubscriptionCardProps {
  subscription: ISubscription | null | undefined;
}

export const CompanySubscriptionCard = ({
  subscription,
}: CompanySubscriptionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Details
        </CardTitle>
        <CardDescription>Current plan and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="text-lg font-semibold">
                  {subscription.plan.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan.description}
                </p>
              </div>
              <SubscriptionBadge status={subscription.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Period Start</p>
                  <p className="font-medium">
                    {formatDate(subscription.currentPeriodStart)}
                  </p>
                </div>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Period End</p>
                    <p className="font-medium">
                      {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {subscription.trialEndsAt && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  Trial ends on {formatDate(subscription.trialEndsAt)}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No active subscription</p>
        )}
      </CardContent>
    </Card>
  );
};
