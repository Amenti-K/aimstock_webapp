"use client";

import React, { useState } from "react";
import {
  useGetAccountsInfinite,
  useGetSummary,
  useCreateAccount,
} from "@/api/account/api.account";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Eye, EyeOff, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AccountForm from "@/components/forms/account/AccountForm";
import { IAccountDetail } from "@/components/interface/interface.account";
import { useRouter } from "next/navigation";
import { BankAvatar } from "@/components/account/BankAvatar";

export default function AccountPage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("ACCOUNT");
  const hasCreateAccess = canCreate("ACCOUNT");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showTotalBalance, setShowTotalBalance] = useState(true);

  const { data, isLoading, isError, refetch } = useGetAccountsInfinite(
    {},
    hasViewAccess,
  );

  const { data: summaryData, refetch: refetchSummary } =
    useGetSummary(hasViewAccess);

  const createAccount = useCreateAccount();

  const accounts = React.useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Accounts" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const handleCreate = (formData: any) => {
    createAccount.mutate(formData, {
      onSuccess: () => {
        setIsAddOpen(false);
        refetch();
        refetchSummary();
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Accounts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your financial accounts and track your performance.
          </p>
        </div>
        <div className="flex gap-2">
          {hasCreateAccess && (
            <Button
              className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all rounded-full px-6"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center px-4">
        <Card className="w-full max-w-2xl bg-gradient-to-br from-primary/10 via-background to-background border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Balance
                  </p>
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
                    {showTotalBalance
                      ? `${Number(summaryData?.totalBalance || 0).toLocaleString()} ETB`
                      : "•••••• ETB"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-primary/20 hover:bg-primary/5 shadow-sm"
                  onClick={() => setShowTotalBalance(!showTotalBalance)}
                >
                  {showTotalBalance ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Wallet className="mr-1.5 h-3.5 w-3.5" />
              Across {accounts.length} active accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden mx-auto w-full">
        <div className="w-full">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="font-semibold py-4 pl-6">
                  Account
                </TableHead>
                <TableHead className="font-semibold py-4 hidden sm:table-cell">
                  Details
                </TableHead>
                <TableHead className="font-semibold py-4 text-right pr-6">
                  Balance
                </TableHead>
                <TableHead className="w-12 pr-4"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-48 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="h-10 w-10 opacity-20" />
                      <p>No accounts found.</p>
                      {hasCreateAccess && (
                        <Button
                          variant="link"
                          onClick={() => setIsAddOpen(true)}
                        >
                          Create your first account
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((acc: IAccountDetail) => (
                  <TableRow
                    key={acc.id}
                    className="cursor-pointer group transition-colors hover:bg-muted/50 border-b last:border-0"
                    onClick={() => router.push(`/account/${acc.id}`)}
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <BankAvatar name={acc.bank} type={acc.type} size={40} />
                        <div className="flex flex-col">
                          <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {acc.name}
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground capitalize sm:hidden">
                            {acc.bank?.toLowerCase().replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {acc.type === "Cash"
                            ? "Physical Cash"
                            : acc.bank?.toLowerCase().replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {acc.type === "Cash"
                            ? "Internal Vault"
                            : `${acc.branch || "General"} • ${acc.number || "---"}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-sm sm:text-base text-foreground">
                          {showTotalBalance
                            ? `${Number(acc.balance).toLocaleString()} ETB`
                            : "••••••"}
                        </span>
                        <span className="text-[10px] text-muted-foreground sm:hidden">
                          Balance
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-4 text-right">
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all transform group-hover:translate-x-1" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Add New Account
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            onSave={handleCreate}
            loading={createAccount.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
