import { Building2, Phone, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { ICompanyList } from "../interface/company/company.interface";
import { formatDate } from "@/lib/formatter";

interface CompanyCardProps {
  company: ICompanyList;
  onSelect: (id: string) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onSelect,
}) => {
  const owner = company.owner;

  return (
    <Card
      onClick={() => onSelect(company.id)}
      className="transition-all hover:shadow-md"
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">
            {company.name}
          </CardTitle>
        </div>
        {company.subscription && (
          <SubscriptionBadge status={company.subscription.status} />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {owner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{owner.name}</span>
          </div>
        )}
        {owner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{owner.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created {formatDate(company.createdAt)}</span>
        </div>
        {company.subscription && (
          <div className="rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">Plan:</span>{" "}
            {company.subscription.plan.name}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
