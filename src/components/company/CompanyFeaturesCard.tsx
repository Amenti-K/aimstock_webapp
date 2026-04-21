import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { PlanFeature } from "@/components/interface/subscription/subscription.interface";

interface CompanyFeaturesCardProps {
  features: PlanFeature[] | undefined;
}

export const CompanyFeaturesCard = ({ features }: CompanyFeaturesCardProps) => {
  if (!features) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Features</CardTitle>
        <CardDescription>Features included in the current plan</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {features.map((feature: PlanFeature, index: number) => (
            <Badge
              key={`${feature.feature}-${index}`}
              variant={feature.enabled ? "default" : "outline"}
              className="capitalize"
            >
              {feature.enabled && <CheckCircle className="mr-1 h-3 w-3" />}
              {feature.feature.toLowerCase().replace("_", " ")}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
