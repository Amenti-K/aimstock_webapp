import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BillingInterval,
  ISubscription,
  SubscriptionAction,
  SubscriptionStatus,
} from "../interface/subscription/subscription.interface";
import {
  subscriptionActionSchema,
  SubscriptionActionFormValues,
} from "../schema/subscription.schema";
import { useFetchPlans } from "@/api/subscription/api.plan";
import {
  useActivateSubscription,
  useCreateSubscription,
} from "@/api/subscription/api.subscription";
import { useEffect } from "react";
import SelectField from "@/components/forms/fields/SelectField";

interface Props {
  open: boolean;
  onClose: () => void;
  action: SubscriptionAction;
  subscription?: ISubscription | null;
  companyId: string;
}

export const SubscriptionActionModal = ({
  open,
  onClose,
  action,
  subscription,
  companyId,
}: Props) => {
  const { data } = useFetchPlans();
  const createSubscription = useCreateSubscription();
  const activateSubscription = useActivateSubscription();
  const planOptions = data?.data;

  const isPending =
    createSubscription.isPending || activateSubscription.isPending;

  const form = useForm<SubscriptionActionFormValues>({
    resolver: zodResolver(subscriptionActionSchema),
    defaultValues: {
      action,
      planId: subscription?.planId,
      status: SubscriptionStatus.TRIALING,
      duration: BillingInterval.MONTHLY,
    },
  });

  // Reset form when modal opens or action changes
  useEffect(() => {
    if (open) {
      form.reset({
        action,
        planId: subscription?.planId || "",
        status: SubscriptionStatus.TRIALING,
        duration: BillingInterval.MONTHLY,
      });
    }
  }, [open, action, subscription, form]);

  const onSubmit = (data: SubscriptionActionFormValues) => {
    if (action === "CREATE") {
      createSubscription.mutate(
        {
          companyId,
          planId: data.planId!, // Validated by schema
          status: data.status!,
          duration: data.duration,
        },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      // ACTIVATE or EXTEND
      activateSubscription.mutate(
        {
          companyId,
          duration: data.duration, // Validated by schema
          planId: data.planId!,
        },
        {
          onSuccess: () => onClose(),
        },
      );
    }
  };

  const planSelectOptions =
    planOptions?.map((p) => ({
      label: p.name,
      value: p.id,
    })) || [];

  const durationOptions = [
    { label: "Monthly", value: BillingInterval.MONTHLY },
    { label: "3 Months", value: BillingInterval.THREE_MONTHS },
    { label: "6 Months", value: BillingInterval.SIX_MONTHS },
    { label: "Yearly", value: BillingInterval.YEARLY },
  ];

  const statusOptions = [
    { label: "Trial", value: SubscriptionStatus.TRIALING },
    { label: "Active", value: SubscriptionStatus.ACTIVE },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent aria-describedby={action} className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === "CREATE"
              ? "Create Subscription"
              : action === "ACTIVATE"
                ? "Activate Subscription"
                : "Extend Subscription"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <SelectField
            name="planId"
            control={form.control}
            placeholder="Select Plan"
            options={planSelectOptions}
          />

          <SelectField
            name="duration"
            control={form.control}
            placeholder="Billing Interval"
            options={durationOptions}
          />

          {action === "CREATE" && (
            <SelectField
              name="status"
              control={form.control}
              placeholder="Status"
              options={statusOptions}
            />
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Processing..." : "Confirm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
