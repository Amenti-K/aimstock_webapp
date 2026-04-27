"use client";

import React from "react";
import { useInfiniteLoanPartners } from "@/api/loan/api.loan";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, HandCoins } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoanSettlingModal } from "@/components/loan/LoanSettlingModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/language.hook";
import { formatCurrency } from "@/lib/formatter";

export default function LoanPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("LOANS");
  const hasCreateAccess = canCreate("LOANS");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteLoanPartners(hasViewAccess);

  const loanPartners = React.useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  const [settlePartner, setSettlePartner] = React.useState<any>(null);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("loan.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const totalGiven = loanPartners
    .filter((p: any) => p.balance > 0)
    .reduce((sum: number, p: any) => sum + p.balance, 0);

  const totalTaken = loanPartners
    .filter((p: any) => p.balance < 0)
    .reduce((sum: number, p: any) => sum + Math.abs(p.balance), 0);

  const partnersGivenCount = loanPartners.filter(
    (p: any) => p.balance > 0,
  ).length;
  const partnersTakenCount = loanPartners.filter(
    (p: any) => p.balance < 0,
  ).length;

  return (
    <div className="space-y-6 p-2 pb-20 md:pb-6">
      <div className="hidden sm:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("loan.moduleName")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("loan.emptyLoan")}</p>
        </div>
        {hasCreateAccess && (
          <Button
            className="flex w-full sm:w-auto"
            onClick={() => router.push("/loan/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("loan.form.addLoan")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              {t("loan.card.totalGiven")}
            </h3>
            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-emerald-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-600">
              {formatCurrency(totalGiven)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("loan.card.totalGivenCount", { count: partnersGivenCount })}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">
              {t("loan.card.totalTaken")}
            </h3>
            <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-red-500"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">
              {formatCurrency(totalTaken)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("loan.card.totalTakenCount", { count: partnersTakenCount })}
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("loan.form.partner")}</TableHead>
              <TableHead>{t("loan.detail.currentBal")}</TableHead>
              <TableHead className="w-[100px] text-right">
                {t("loan.detail.tranx.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loanPartners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t("loan.emptyLoan")}
                </TableCell>
              </TableRow>
            ) : (
              loanPartners.map((lp: any) => {
                const balance = Number(lp.balance || lp.totalLoan || 0);
                return (
                  <TableRow
                    key={lp.id}
                    className="cursor-pointer"
                    onClick={() => {
                      const queryObj = new URLSearchParams({
                        balance: balance.toString(),
                        name: lp.name,
                        phone: lp.phone,
                        address: lp.address,
                      });
                      router.push(`/loan/${lp.id}?${queryObj.toString()}`);
                    }}
                  >
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                        {lp.name}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`font-bold ${balance < 0 ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {formatCurrency(Math.abs(balance))}
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground uppercase">
                        (
                        {balance < 0
                          ? t("loan.card.youOwe")
                          : t("loan.card.owesYou")}
                        )
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {balance !== 0 && (
                          <Button
                            size="sm"
                            variant={balance < 0 ? "destructive" : "default"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSettlePartner(lp);
                            }}
                          >
                            {balance < 0
                              ? t("loan.card.pay")
                              : t("loan.card.receive")}
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const queryObj = new URLSearchParams({
                                  balance: balance.toString(),
                                  name: lp.name,
                                  phone: lp.phone,
                                  address: lp.address,
                                });
                                router.push(
                                  `/loan/${lp.id}?${queryObj.toString()}`,
                                );
                              }}
                            >
                              {t("loan.detail.transactions")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loanPartners.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            {t("loan.emptyLoan")}
          </div>
        ) : (
          loanPartners.map((lp: any) => {
            const balance = Number(lp.balance || lp.totalLoan || 0);
            return (
              <div
                key={lp.id}
                className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm"
                onClick={() => {
                  const queryObj = new URLSearchParams({
                    balance: balance.toString(),
                    name: lp.name,
                    phone: lp.phone,
                    address: lp.address,
                  });
                  router.push(`/loan/${lp.id}?${queryObj.toString()}`);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {lp.name?.substring(0, 2).toUpperCase() || "LP"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold">{lp.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lp.phone || t("loan.card.noPhone")}
                      </span>
                    </div>
                  </div>
                  {balance !== 0 && (
                    <Button
                      className="w-fit text-sm"
                      variant={balance < 0 ? "destructive" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettlePartner(lp);
                      }}
                    >
                      {balance < 0
                        ? t("loan.card.pay")
                        : t("loan.card.receive")}
                    </Button>
                  )}
                  <div className="flex flex-col items-end">
                    <span
                      className={`font-bold ${balance < 0 ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {formatCurrency(balance)}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">
                      {balance === 0
                        ? t("loan.card.settle")
                        : balance < 0
                          ? t("loan.card.youOwe")
                          : t("loan.card.owesYou")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-center w-full py-4">
        {hasNextPage && (
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full sm:w-auto"
          >
            {isFetchingNextPage ? t("loan.pendingLoan") : t("common.loadMore")}
          </Button>
        )}
      </div>

      {hasCreateAccess && (
        <Button
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50 p-0"
          onClick={() => router.push("/loan/new")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {settlePartner && (
        <LoanSettlingModal
          open={!!settlePartner}
          onOpenChange={(open) => !open && setSettlePartner(null)}
          partnerId={settlePartner.id}
          partnerName={settlePartner.name}
          balance={Number(
            settlePartner.balance || settlePartner.totalLoan || 0,
          )}
        />
      )}
    </div>
  );
}
