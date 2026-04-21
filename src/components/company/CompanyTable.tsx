import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { ICompanyList } from "../interface/company/company.interface";
import { formatDate } from "@/lib/formatter";

interface CompanyTableProps {
  companies: ICompanyList[];
  onSelect: (id: string) => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onSelect,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary">
            <TableHead className="rounded-tl-md">Company Name</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="rounded-tr-md">Created</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No companies found.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => {
              const owner = company.owner;
              return (
                <TableRow
                  key={company.id}
                  onClick={() => onSelect(company.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{owner?.name || "-"}</TableCell>
                  <TableCell>{owner?.phoneNumber || "-"}</TableCell>
                  <TableCell>
                    {company.subscription?.plan.name || "-"}
                  </TableCell>
                  <TableCell>
                    {company.subscription ? (
                      <SubscriptionBadge status={company.subscription.status} />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(company.createdAt)}</TableCell>
                  {/* <TableCell className="text-rights">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => `/companies/${company.id}`}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </TableCell> */}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
