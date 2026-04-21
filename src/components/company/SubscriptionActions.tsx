import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ISubscription,
  SubscriptionAction,
  SubscriptionStatus,
} from "@/components/interface/subscription/subscription.interface";
import { useCancelSubscription } from "@/api/subscription/api.subscription";
import { useState } from "react";
import { SubscriptionActionModal } from "./SubscriptionActionModal";

interface SubscriptionActionsProps {
  companyId: string;
  subscription: ISubscription | null | undefined;
}

export const SubscriptionActions = ({
  companyId,
  subscription,
}: SubscriptionActionsProps) => {
  const [modalAction, setModalAction] = useState<SubscriptionAction | null>(
    null
  );

  const cancelSubscription = useCancelSubscription();

  const handleCancelSubscription = () => {
    if (confirm("Are you sure you want to cancel this subscription?")) {
      cancelSubscription.mutate({
        companyId: companyId,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Actions</CardTitle>
        <CardDescription>Manage this company's subscription</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          {!subscription && (
            <Button onClick={() => setModalAction("CREATE")}>
              Create Subscription
            </Button>
          )}

          {(subscription?.status === SubscriptionStatus.TRIALING ||
            subscription?.status === SubscriptionStatus.PAST_DUE ||
            subscription?.status === SubscriptionStatus.EXPIRED ||
            subscription?.status === SubscriptionStatus.CANCELED) && (
            <Button onClick={() => setModalAction("ACTIVATE")}>
              Activate Subscription
            </Button>
          )}

          {subscription?.status === SubscriptionStatus.ACTIVE && (
            <Button onClick={() => setModalAction("EXTEND")}>
              Extend Subscription
            </Button>
          )}

          {subscription &&
            subscription?.status !== SubscriptionStatus.CANCELED && (
              <Button
                onClick={handleCancelSubscription}
                variant="destructive"
                disabled={cancelSubscription.isPending}
              >
                Cancel Subscription
              </Button>
            )}
        </div>
      </CardContent>

      <SubscriptionActionModal
        open={!!modalAction}
        action={modalAction!}
        subscription={subscription}
        companyId={companyId}
        onClose={() => setModalAction(null)}
      />
    </Card>
  );
};
