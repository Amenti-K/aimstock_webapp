"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  ReceiptText,
  Calendar,
  FileText,
  CreditCard,
  Banknote,
  Info,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import LastAudit from "@/components/audit/LastAudit";

export default function ExpenseDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const expenseId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);

  const hasViewAccess = canView("EXPENSE");
  const hasUpdateAccess = canUpdate("EXPENSE");
  const hasDeleteAccess = canDelete("EXPENSE");

  const { data, isLoading, isError, refetch } = useFetchExpenseById(
    expenseId,
    hasViewAccess,
  );
  const deleteExpense = useDeleteExpense();

  if (!hasViewAccess)
    return <AccessDeniedView moduleName={t("expense.moduleName")} />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const expense: any = data.data;
  const bankPayments = expense.expensePayments ?? [];
  const cash = Number(expense.expenseCashPayment?.amount || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl hover:bg-card"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {t("common.back")} to {t("expense.moduleName")}
          </span>
          <span className="sm:hidden">{t("common.back")}</span>
        </Button>

        <div className="z-20 flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {hasUpdateAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-background/50 backdrop-blur-sm shadow-sm border-none hover:bg-muted"
                onClick={() => router.push(`/expense/${expenseId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </Button>
            )}
            {hasDeleteAccess && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl shadow-md"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </Button>
            )}
          </div>

          {/* Mobile Actions Overlay */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-background/50 backdrop-blur-sm border-none shadow-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-xl bg-card border-none shadow-lg z-[100]"
              >
                {hasUpdateAccess && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/expense/${expenseId}/edit`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                  </DropdownMenuItem>
                )}
                {hasDeleteAccess && (
                  <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => setOpenDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Title & Amount Section */}
        <div className="text-center space-y-2 pt-2 pb-8">
          <div className="inline-flex p-3 rounded-2xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-2">
            <ReceiptText className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            {t("expense.detail.totalAmt")}
          </h1>
          <p className="text-5xl font-black text-foreground tracking-tighter">
            {formatCurrency(expense.amount)}
          </p>
          <div className="flex items-center justify-center gap-4 text-[10px] sm:text-sm text-muted-foreground mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>{formatDate(expense.createdAt)}</span>
            </div>
            <LastAudit
              lastAudit={expense.lastAuditLog}
              className="opacity-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Details Card */}
          <div className="border-none shadow-xl bg-card/50 overflow-hidden rounded-[2rem]">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">
                    {t("expense.card.description")}
                  </h3>
                </div>
                <p className="text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2 text-lg">
                  {expense.description || t("common.notSpecified")}
                </p>
              </div>
            </CardContent>
          </div>

          {/* Payment Breakdown Card */}
          <div className="border-none shadow-xl bg-card/50 flex flex-col rounded-[2rem]">
            <CardContent className="p-8 flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/10 text-green-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="font-black text-lg tracking-tight">
                  {t("expense.detail.paymentTitle")}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20 text-green-700 dark:text-green-400">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-black uppercase tracking-wider">
                      {t("expense.detail.cashPay")}
                    </span>
                  </div>
                  <span className="font-black text-lg text-green-700 dark:text-green-400">
                    {formatCurrency(cash)}
                  </span>
                </div>

                {bankPayments.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-muted-foreground px-1 uppercase tracking-[0.2em]">
                      {t("expense.detail.bankPay")}
                    </p>
                    {bankPayments.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 transition-transform hover:scale-[1.02]"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground">
                            {item.account?.name ||
                              t("expense.detail.unknownBank")}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                            {item.account?.bank || "Standard"}
                          </span>
                        </div>
                        <span className="font-black text-lg text-blue-700 dark:text-blue-400">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <div className="p-6 rounded-[1.5rem] bg-foreground text-background dark:bg-muted dark:text-foreground shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-70">
                      {t("expense.form.total.paid")}
                    </span>
                    <span className="text-2xl font-black">
                      {formatCurrency(Number(expense.amount))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight">
              {t("common.confirmDelete.title", {
                entity: t("expense.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium leading-relaxed">
              {t("common.confirmDelete.message", {
                entity: t("expense.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-2xl font-bold h-12 flex-1">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-bold h-12 flex-1 shadow-lg shadow-destructive/20"
              onClick={() =>
                deleteExpense.mutate(
                  { id: expenseId },
                  { onSuccess: () => router.push("/expense") },
                )
              }
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
