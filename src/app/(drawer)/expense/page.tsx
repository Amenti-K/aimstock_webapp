"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetExpensesInfinite } from "@/api/expense/api.expense";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ReceiptText,
  ChevronRight,
  Calendar,
  Tag,
  Wallet,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/formatter";
import { Card, CardContent } from "@/components/ui/card";

export default function ExpensePage() {
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

  const expenses = React.useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Expenses" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground/90">
            Expenses
          </h1>
          <p className="text-muted-foreground">
            Track and manage your company operating costs.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push("/expense/new")}
          >
            <Plus className="mr-2 h-5 w-5" /> New Expense
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-semibold px-6 py-4">Date</TableHead>
              <TableHead className="font-semibold">Description</TableHead>
              <TableHead className="font-semibold text-right px-6">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-48 text-center text-muted-foreground italic"
                >
                  No expenses recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((exp: any) => (
                <TableRow
                  key={exp.id}
                  className="cursor-pointer transition-colors hover:bg-muted/30 group border-muted/20"
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
                        {exp.description || "Uncategorized Expense"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-3 group-hover:translate-x-1 transition-transform">
                      <span className="font-bold text-red-600 dark:text-red-400 text-lg">
                        {formatCurrency(exp.amount)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground italic">
            No expenses recorded yet.
          </div>
        ) : (
          expenses.map((exp: any) => (
            <Card
              key={exp.id}
              className="overflow-hidden border-none shadow-md active:scale-[0.98] transition-all bg-card/80 backdrop-blur-sm"
              onClick={() => router.push(`/expense/${exp.id}`)}
            >
              <CardContent className="p-0">
                <div className="flex items-center p-4">
                  <div className="mr-4 p-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-foreground truncate max-w-[70%]">
                        {exp.description || "General Expense"}
                      </p>
                      <p className="text-base font-black text-red-600 dark:text-red-400">
                        {formatCurrency(exp.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(exp.createdAt)}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-8">
          <Button
            variant="ghost"
            className="text-primary font-semibold hover:bg-primary/5 px-8 py-6 rounded-full border border-primary/20 shadow-sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Loading...
              </div>
            ) : (
              "View More Expenses"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
