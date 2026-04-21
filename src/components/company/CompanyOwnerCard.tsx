import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Phone, Calendar } from "lucide-react";
import { formatDate } from "@/lib/formatter";
import { IUser } from "@/components/interface/user/user.interface";

interface CompanyOwnerCardProps {
  owner: IUser | null | undefined;
  createdAt: string;
}

export const CompanyOwnerCard = ({
  owner,
  createdAt,
}: CompanyOwnerCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Owner Information
        </CardTitle>
        <CardDescription>Primary account holder details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {owner ? (
          <>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{owner.name}</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{owner.phoneNumber}</p>
                <p className="text-sm text-muted-foreground">Phone Number</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{formatDate(createdAt)}</p>
                <p className="text-sm text-muted-foreground">Member Since</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No owner assigned</p>
        )}
      </CardContent>
    </Card>
  );
};
