import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SubscriptionStatus } from "./interface/subscription/subscription.interface";

interface SubscriptionBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

const statusConfig: Record<
  SubscriptionStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  [SubscriptionStatus.ACTIVE]: { label: "Active", variant: "default" },
  [SubscriptionStatus.TRIALING]: { label: "Trial", variant: "secondary" },
  [SubscriptionStatus.EXPIRED]: { label: "Expired", variant: "destructive" },
  [SubscriptionStatus.PAST_DUE]: { label: "Past Due", variant: "destructive" },
  [SubscriptionStatus.CANCELED]: { label: "Canceled", variant: "outline" },
  [SubscriptionStatus.UNPAID]: { label: "Unpaid", variant: "destructive" },
};

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
  status,
  className,
}) => {
  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
  };

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
};
