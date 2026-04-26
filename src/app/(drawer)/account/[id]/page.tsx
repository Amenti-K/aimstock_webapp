"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAccount,
  useFetchAccountSelector,
  useTransferFunds,
  useDeleteAccount,
} from "@/api/account/api.account";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingBag,
  TrendingUp,
  Receipt,
  ArrowLeftRight,
  HandCoins,
  History,
  Pencil,
  Trash2,
  Hash,
  CheckCircle2,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { BankAvatar } from "@/components/account/BankAvatar";
import { useLanguage } from "@/hooks/language.hook";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import LastAudit from "@/components/audit/LastAudit";
import TransferFundsForm from "@/components/forms/account/TransferFundsForm";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { MoreVertical } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { company } = useAppSelector((state) => state.userAuth);

  const isMobile = useIsMobile();
  const { canUpdate, canDelete } = usePermissions();
  const hasUpdateAccess = canUpdate("ACCOUNT");
  const hasDeleteAccess = canDelete("ACCOUNT");

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const {
    data: accountData,
    isLoading,
    isError,
    refetch,
  } = useGetAccount(id as string);
  const { data: accountsData } = useFetchAccountSelector();
  const transferFunds = useTransferFunds();
  const deleteAccount = useDeleteAccount();

  if (isLoading) return <LoadingView />;
  if (isError || !accountData?.data) return <ErrorView refetch={refetch} />;

  const account = accountData.data;
  const transactions = account.transactions || [];
  const accounts = accountsData?.data || [];
  const isCashAccount = account.type === "Cash";

  const handleTransfer = (data: any) => {
    transferFunds.mutate(data, {
      onSuccess: () => {
        setIsTransferOpen(false);
        refetch();
      },
    });
  };

  const handleDelete = () => {
    deleteAccount.mutate(
      { id: account.id },
      {
        onSuccess: () => {
          setIsDeleteAlertOpen(false);
          router.push("/account");
        },
      },
    );
  };

  const getTransactionIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "purchase":
        return <ShoppingBag className="h-4 w-4 text-orange-500" />;
      case "sale":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "expense":
        return <Receipt className="h-4 w-4 text-rose-500" />;
      case "transfer":
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case "loan":
        return <HandCoins className="h-4 w-4 text-indigo-500" />;
      default:
        return <History className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatAccountNumber = (num: string | undefined) => {
    if (!num) return "**** **** **** ****";
    const last4 = num.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 ">
      {/* 1. Top Part: Header with Back Button and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-11 w-11 bg-background shadow-sm border border-muted hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {account.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <LastAudit
                lastAudit={account.lastAuditLog}
                className="opacity-80"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {!isCashAccount && hasUpdateAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-4 font-bold border-muted-foreground/10 hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => router.push(`/account/${id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common:edit")}
              </Button>
            )}
            {!isCashAccount && hasDeleteAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-10 px-4 font-bold text-destructive border-destructive/10 hover:bg-destructive/5 transition-all"
                onClick={() => setIsDeleteAlertOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common:delete")}
              </Button>
            )}
          </div>

          {/* Mobile Actions More Button */}
          <div className="sm:hidden">
            {!isCashAccount && (hasUpdateAccess || hasDeleteAccess) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 rounded-xl bg-card border-muted-foreground/10 shadow-xl"
                >
                  {hasUpdateAccess && (
                    <DropdownMenuItem
                      className="rounded-lg m-1 py-2.5 font-bold"
                      onClick={() => router.push(`/account/${id}/edit`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> {t("common:edit")}
                    </DropdownMenuItem>
                  )}
                  {hasDeleteAccess && (
                    <DropdownMenuItem
                      className="rounded-lg m-1 py-2.5 text-destructive font-bold"
                      onClick={() => setIsDeleteAlertOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> {t("common:delete")}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Part: Virtual Card and Transfer Form Next to Each Other */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Virtual Card */}
        <div className="relative h-64 sm:h-72 w-full max-w-md mx-auto lg:mx-0 rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#ef4444] transition-transform duration-700 group-hover:scale-110" />

          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-3xl" />

          <div className="relative h-full p-8 sm:p-10 flex flex-col text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {isCashAccount ? (
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                    <History className="h-8 w-8 text-white" />
                  </div>
                ) : (
                  <BankAvatar
                    name={account.bank}
                    type={account.type}
                    size={64}
                  />
                )}
                <div>
                  <p className="text-lg sm:text-xl font-bold tracking-wide">
                    {isCashAccount
                      ? t("accounts.accountCard.cash")
                      : t(`accounts.bank.${account.bank}`)}
                  </p>
                  <p className="text-xs text-white/70 font-medium tracking-wider">
                    {account.branch || t("accounts.accountCard.headquarters")}
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd9007a] blur-lg opacity-50" />
                <Hash className="h-10 w-10 text-white/40 rotate-12 relative" />
              </div>
            </div>

            <div className="mt-auto space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-0">
                  {t("accounts.accountCard.accountNumber")}
                </p>
                <p className="text-xl sm:text-2xl font-mono tracking-[0.2em] text-white/90">
                  {formatAccountNumber(account.number)}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-0">
                    {t("accounts.accountCard.holder")}
                  </p>
                  <p className="text-sm font-bold tracking-wider text-white/80">
                    {company?.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
                      {t("accounts.accountCard.balance")}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBalance(!showBalance);
                      }}
                      className="hover:text-white/100 transition-colors bg-white/10 p-1 rounded-md"
                    >
                      {showBalance ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black tabular-nums tracking-tighter">
                    {showBalance
                      ? formatCurrency(Number(account.balance))
                      : "••••••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Form or Button */}
        <div className="w-full h-full flex flex-col">
          {isMobile ? (
            <Button
              onClick={() => setIsTransferOpen(true)}
              className="w-full h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group"
            >
              <ArrowLeftRight className="mr-3 h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
              {t("accounts.transfer.transfer")}
            </Button>
          ) : (
            <div className="p-0 border-none shadow-xl rounded-[1.5rem] overflow-hidden bg-primary/5 border border-primary/10 h-full">
              <CardHeader className="p-4 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <ArrowLeftRight className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight uppercase">
                    {t("accounts.transfer.title")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <TransferFundsForm
                  fromAccountId={account.id}
                  accounts={accounts}
                  onTransfer={handleTransfer}
                  loading={transferFunds.isPending}
                />
              </CardContent>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Part: Ledger List (Responsive Table/Cards) */}
      <div className="border-none shadow-xl rounded-[1.5rem] overflow-hidden">
        <CardHeader className="bg-muted/30 px-6 py-6 sm:px-10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight">
              {t("accounts.tranxCard.transactions")}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t("accounts.tranxCard.subtitle")}
            </CardDescription>
          </div>
          <Badge className="rounded-full bg-primary/10 text-primary border-none font-bold px-4 h-8">
            {transactions.length} {t("accounts.tranxCard.records")}
          </Badge>
        </CardHeader>
        <CardContent className="p-0 sm:p-2">
          {/* Card list for mobile */}
          <div className="block sm:hidden divide-y divide-muted px-4">
            {transactions.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <History className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium italic">
                  {t("accounts.emptyTranxs")}
                </p>
              </div>
            ) : (
              transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="py-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "p-3 rounded-2xl border shrink-0",
                        tx.direction === "in"
                          ? "bg-emerald-50 border-emerald-100"
                          : "bg-rose-50 border-rose-100",
                      )}
                    >
                      {getTransactionIcon(tx.source)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground truncate capitalize">
                        {tx.source.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-base font-black tabular-nums",
                        tx.direction === "in"
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {tx.direction === "in" ? "+" : "-"}{" "}
                      {Number(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 italic truncate max-w-[100px]">
                      {tx.description || "---"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table view for desktop */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader className="bg-muted/10 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-5 pl-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
                    {t("accounts.tranxCard.transaction")}
                  </TableHead>
                  <TableHead className="py-5 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
                    {t("accounts.tranxCard.description")}
                  </TableHead>
                  <TableHead className="py-5 text-right pr-10 text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">
                    {t("accounts.tranxCard.amount")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-24 text-center">
                      <History className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                      <p className="text-muted-foreground font-bold italic">
                        {t("accounts.emptyTranxs")}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow
                      key={tx.id}
                      className="hover:bg-muted/20 border-b border-muted/50 last:border-0 transition-colors group"
                    >
                      <TableCell className="py-6 pl-10">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-2xl border transition-transform group-hover:scale-110",
                              tx.direction === "in"
                                ? "bg-emerald-50 border-emerald-100"
                                : "bg-rose-50 border-rose-100",
                            )}
                          >
                            {getTransactionIcon(tx.source)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground capitalize leading-tight mb-1">
                              {tx.source.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              {formatDate(tx.createdAt)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <p className="text-xs font-semibold text-muted-foreground italic line-clamp-1 max-w-[250px]">
                          {tx.description ||
                            t("accounts.tranxCard.noDescription")}
                        </p>
                      </TableCell>
                      <TableCell className="py-6 text-right pr-10">
                        <div className="flex flex-col items-end">
                          <p
                            className={cn(
                              "text-lg font-black tabular-nums tracking-tight",
                              tx.direction === "in"
                                ? "text-emerald-600"
                                : "text-rose-600",
                            )}
                          >
                            {tx.direction === "in" ? "+" : "-"}{" "}
                            {Number(tx.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground/40 tracking-wider">
                            {tx.direction === "in"
                              ? t("accounts.tranxCard.received")
                              : t("accounts.tranxCard.sent")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>

      {/* Modals & Dialogs */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl max-h-[95vh] flex flex-col">
          <div className="bg-primary px-5 sm:px-6 py-6 sm:py-8 text-primary-foreground shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
                {t("accounts.transfer.title")}
              </DialogTitle>
              <p className="text-primary-foreground/70 text-xs sm:text-sm mt-2">
                {t("accounts.transfer.subtitle")}
              </p>
            </DialogHeader>
          </div>
          <div className="p-5 sm:p-6 overflow-y-auto">
            <TransferFundsForm
              fromAccountId={account.id}
              accounts={accounts}
              onTransfer={handleTransfer}
              loading={transferFunds.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {t("common:confirmDelete.title", {
                entity: t("accounts.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              {t("common:confirmDelete.message", { entity: account.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="rounded-full h-11 text-xs font-bold shrink-0">
              {t("common:cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full h-11 px-6 text-xs font-bold shadow-lg shadow-destructive/20 shrink-0"
              onClick={handleDelete}
            >
              {t("common:delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
