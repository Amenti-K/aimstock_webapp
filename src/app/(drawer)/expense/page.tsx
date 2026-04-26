"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetExpensesInfinite } from "@/api/expense/api.expense";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ReceiptText,
  ChevronRight,
  ArrowRight,
  Banknote,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/formatter";

export default function ExpensePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("EXPENSE");
  const hasCreateAccess = canCreate("EXPENSE");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetExpensesInfinite({}, hasViewAccess);

  const expenses = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("expense.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="relative min-h-[calc(100vh-200px)] space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <ReceiptText className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("expense.moduleName")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("expense.emptyExpense")}
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="hidden sm:flex bg-primary hover:bg-primary/90 shadow-sm"
            onClick={() => router.push("/expense/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("expense.form.addExpense")}
          </Button>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      {hasCreateAccess && (
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden z-50 bg-primary hover:bg-primary/90"
          size="icon"
          onClick={() => router.push("/expense/new")}
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <ReceiptText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("expense.emptyExpense")}
            </p>
          </div>
        ) : (
          expenses.map((exp: any) => (
            <ExpenseMobileCard
              key={exp.id}
              expense={exp}
              onClick={() => router.push(`/expense/${exp.id}`)}
              t={t}
            />
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold px-6 py-4">
                {t("common.date")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("expense.card.description")}
              </TableHead>
              <TableHead className="font-semibold text-right px-6">
                {t("expense.card.amount")}
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("expense.emptyExpense")}
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((exp: any) => (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/expense/${exp.id}`)}
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <ReceiptText className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground/80">
                        {formatDate(exp.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 max-w-[400px]">
                      <span className="text-sm font-medium leading-none text-foreground/90 truncate">
                        {exp.description || t("expense.detail.unknownBank")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(exp.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="ghost"
            className="text-primary font-medium hover:bg-primary/5 rounded-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t("common.loading") : t("common.showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ExpenseMobileCard({
  expense,
  onClick,
  t,
}: {
  expense: any;
  onClick: () => void;
  t: any;
}) {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <ReceiptText className="h-8 w-8" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-lg leading-none truncate max-w-[150px]">
              {expense.description || t("expense.moduleName")}
            </h3>
            <span className="text-xs text-muted-foreground mt-1.5 font-medium">
              {formatDate(expense.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-black text-lg text-red-600 dark:text-red-400">
            {formatCurrency(expense.amount)}
          </span>
          <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
