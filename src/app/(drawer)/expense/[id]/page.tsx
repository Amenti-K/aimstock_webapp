"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ReceiptText,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  useDeleteExpense,
  useFetchExpenseById,
} from "@/api/expense/api.expense";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import LastAudit from "@/components/audit/LastAudit";

export default function ExpenseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const expenseId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);
  const { data, isLoading, isError, refetch } = useFetchExpenseById(
    expenseId,
    canView("EXPENSE"),
  );
  const deleteExpense = useDeleteExpense();

  if (!canView("EXPENSE")) return <AccessDeniedView moduleName="Expenses" />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const expense: any = data.data;
  const bankPayments = expense.expensePayments ?? [];
  const cash = Number(expense.expenseCashPayment?.amount || 0);
  const bankTotal = bankPayments.reduce(
    (sum: number, item: any) => sum + Number(item.amount || 0),
    0,
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="hover:bg-accent/50 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          {canUpdate("EXPENSE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/expense/${expenseId}/edit`)}
              className="rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {canDelete("EXPENSE") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setOpenDelete(true)}
              className="rounded-full shadow-sm hover:shadow-md transition-all"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </Button>
          )}
        </div>
      </div>
      <div className="flex justify-center -mt-4">
        <LastAudit lastAudit={expense.lastAuditLog} />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Title & Amount Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-2">
            <ReceiptText className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Total Expense
          </h1>
          <p className="text-5xl font-black text-foreground tracking-tighter">
            {formatCurrency(expense.amount)}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(expense.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details Card */}
          <Card className="border-none shadow-xl bg-card/50 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">Description</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                  {expense.description || "No specific description provided."}
                </p>
              </div>

              <Separator className="opacity-50" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold">Recorded Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Created Date</span>
                    <span className="text-foreground font-medium">
                      {formatDate(expense.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Reference ID</span>
                    <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded text-xs">
                      EXE-{expenseId.split("-")[0].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown Card */}
          <Card className="border-none shadow-xl bg-card/50 flex flex-col">
            <CardContent className="p-6 flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-bold">Payment Breakdown</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Cash Payment</span>
                  </div>
                  <span className="font-bold">{formatCurrency(cash)}</span>
                </div>

                {bankPayments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                      Bank Accounts
                    </p>
                    {bankPayments.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 scale-[0.99] hover:scale-100 transition-transform"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {item.account?.name || "Bank Account"}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {item.account?.bank || "Standard"}
                          </span>
                        </div>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4">
                <div className="p-4 rounded-2xl bg-foreground text-background dark:bg-muted dark:text-foreground">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium opacity-80">
                      Settled Amount
                    </span>
                    <span className="text-xl font-black">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete this record?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action permanent and cannot be undone. Are you sure you want
              to delete this expense history?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={() =>
                deleteExpense.mutate(
                  { id: expenseId },
                  { onSuccess: () => router.push("/expense") },
                )
              }
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
