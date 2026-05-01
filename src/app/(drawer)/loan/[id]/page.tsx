"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  MoreHorizontal,
  FileText,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  ShoppingCart,
  ShoppingBag,
  CheckCircle2,
  Wallet,
  Settings,
  Calendar,
  Clock,
  ExternalLink,
  History,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import {
  useGetLoanTransactionsInfinite,
  useDeleteLoanTx,
} from "@/api/loan/api.loan";
import {
  LoanTxType,
  ILoanTranx,
} from "@/components/interface/loan/loan.interface";
import { useLanguage } from "@/hooks/language.hook";
import { formatCurrency } from "@/lib/formatter";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import LastAudit from "@/components/audit/LastAudit";
import { ILastAudit } from "@/components/interface/auditLog/interface.audit";

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();

  const partnerId = params.id as string;
  const searchParams = useSearchParams();

  const partnerName = searchParams.get("name") || "...";
  const partnerBalance = Number(searchParams.get("balance") || 0);
  const partnerPhone = searchParams.get("phone") || "...";
  const partnerAddress = searchParams.get("address") || "...";

  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("LOANS");
  const hasCreateAccess = canCreate("LOANS");
  const hasEditAccess = canUpdate("LOANS");
  const hasDeleteAccess = canDelete("LOANS");

  const [selectedTx, setSelectedTx] = useState<ILoanTranx | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetLoanTransactionsInfinite(partnerId, hasViewAccess);

  const deleteTxMutate = useDeleteLoanTx();

  const transactions = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.data ?? []) ?? [];
  }, [data]);

  const getTxTypeConfig = (txType: LoanTxType) => {
    const configs = {
      [LoanTxType.LOAN_GIVEN]: {
        label: "loanGiven",
        description: "givenDes",
        icon: <ArrowUpCircle className="h-4 w-4 text-emerald-500" />,
        colorClass: "text-emerald-600 bg-emerald-50",
        fullIcon: <ArrowUpCircle className="h-8 w-8 text-emerald-500" />,
      },
      [LoanTxType.SALE_FINANCING]: {
        label: "saleFinance",
        description: "saleFinanceDes",
        icon: <ShoppingCart className="h-4 w-4 text-emerald-500" />,
        colorClass: "text-emerald-600 bg-emerald-50",
        fullIcon: <ShoppingCart className="h-8 w-8 text-emerald-500" />,
      },
      [LoanTxType.LOAN_PAYMENT]: {
        label: "paymentMade",
        description: "paymentMadeDes",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        colorClass: "text-emerald-600 bg-emerald-50",
        fullIcon: <CheckCircle2 className="h-8 w-8 text-emerald-500" />,
      },
      [LoanTxType.LOAN_TAKEN]: {
        label: "loanTaken",
        description: "takenDes",
        icon: <ArrowDownCircle className="h-4 w-4 text-red-500" />,
        colorClass: "text-red-600 bg-red-50",
        fullIcon: <ArrowDownCircle className="h-8 w-8 text-red-500" />,
      },
      [LoanTxType.PURCHASE_FINANCING]: {
        label: "purchaseFinance",
        description: "purchaseFinanceDes",
        icon: <ShoppingBag className="h-4 w-4 text-red-500" />,
        colorClass: "text-red-600 bg-red-50",
        fullIcon: <ShoppingBag className="h-8 w-8 text-red-500" />,
      },
      [LoanTxType.LOAN_RECEIPT]: {
        label: "paymentReceived",
        description: "paymentReceivedDes",
        icon: <Wallet className="h-4 w-4 text-red-500" />,
        colorClass: "text-red-600 bg-red-50",
        fullIcon: <Wallet className="h-8 w-8 text-red-500" />,
      },
      [LoanTxType.ADJUSTMENT]: {
        label: "adjustment",
        description: "adjustmentDes",
        icon: <Settings className="h-4 w-4 text-gray-500" />,
        colorClass: "text-gray-600 bg-gray-50",
        fullIcon: <Settings className="h-8 w-8 text-gray-500" />,
      },
    };
    return configs[txType] || configs[LoanTxType.ADJUSTMENT];
  };

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("loan.moduleName")} />;
  }

  const isPositiveBalance = partnerBalance > 0;

  const handleAddTx = () => {
    router.push(
      `/loan/${partnerId}/new?name=${encodeURIComponent(partnerName)}`,
    );
  };

  const handleEditTx = (tx: ILoanTranx) => {
    router.push(
      `/loan/${partnerId}/edit?txId=${tx.id}&name=${encodeURIComponent(partnerName)}`,
    );
  };

  const handleDeleteTx = (tx: ILoanTranx) => {
    if (
      window.confirm(
        t("common.confirmDelete.message", {
          entity: t("loan.detail.tranx.loanTranx"),
        }),
      )
    ) {
      deleteTxMutate.mutate({ id: tx.id });
    }
  };

  const canEditOrDelete = (tx: ILoanTranx) => {
    return (
      tx.txType !== LoanTxType.SALE_FINANCING &&
      tx.txType !== LoanTxType.PURCHASE_FINANCING
    );
  };

  const handleTxClick = (tx: ILoanTranx) => {
    setSelectedTx(tx);
    setIsDetailModalOpen(true);
  };

  if (isLoading) return <LoadingView />;
  if (isError)
    return (
      <ErrorView
        refetch={() => {
          refetch();
        }}
      />
    );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {partnerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {partnerName}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {partnerPhone}
              </p>
            </div>
          </div>
        </div>
        {hasCreateAccess && (
          <Button onClick={handleAddTx} className="hidden sm:flex gap-2">
            <Plus className="h-4 w-4" /> {t("loan.form.addTranx")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/5">
            <h3 className="tracking-tight text-sm font-semibold uppercase text-muted-foreground">
              {t("loan.detail.currentBal")}
            </h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <div
                className={`text-3xl md:text-4xl font-bold tracking-tight ${isPositiveBalance ? "text-emerald-600" : partnerBalance < 0 ? "text-red-600" : ""}`}
              >
                {formatCurrency(Math.abs(partnerBalance))}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium uppercase">
                {isPositiveBalance
                  ? t("loan.card.owesYou")
                  : partnerBalance < 0
                    ? t("loan.card.youOwe")
                    : t("loan.card.settle")}
              </p>
            </div>
            {partnerBalance !== 0 && (
              <Badge
                variant="outline"
                className={`px-4 py-2 gap-2 text-sm font-semibold ${
                  isPositiveBalance
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-red-50 text-red-700 border-red-100"
                }`}
              >
                {isPositiveBalance ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {isPositiveBalance
                  ? t("loan.detail.partnerOwes")
                  : t("loan.detail.companyOwes")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("loan.detail.transactions")}
          </h2>
        </div>

        <div className="hidden md:block rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>{t("loan.detail.tranx.createdDate")}</TableHead>
                <TableHead>{t("loan.form.tranxType")}</TableHead>
                <TableHead>{t("loan.form.amount")}</TableHead>
                <TableHead>{t("loan.detail.tranx.note")}</TableHead>
                <TableHead className="text-right">
                  {t("loan.detail.tranx.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-10 w-10 mb-2 opacity-10" />
                      <p>{t("loan.detail.noTransactions")}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => {
                  const config = getTxTypeConfig(tx.txType);
                  return (
                    <TableRow
                      key={tx.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => handleTxClick(tx)}
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`gap-1.5 font-medium ${config.colorClass}`}
                        >
                          {config.icon}
                          {t(`loan.tranxType.${config.label}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-base">
                        {formatCurrency(Number(tx.amount || 0))}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {tx.note || "—"}
                        </p>
                      </TableCell>
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                        className="text-right"
                      >
                        {canEditOrDelete(tx) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {hasEditAccess && (
                                <DropdownMenuItem
                                  onClick={() => handleEditTx(tx)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />{" "}
                                  {t("common.edit")}
                                </DropdownMenuItem>
                              )}
                              {hasDeleteAccess && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:bg-red-50 focus:text-red-600"
                                  onClick={() => handleDeleteTx(tx)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />{" "}
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold uppercase tracking-tight"
                          >
                            {t("loan.system.system")}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 gap-4 md:hidden">
          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center text-muted-foreground">
              {t("loan.detail.noTransactions")}
            </div>
          ) : (
            transactions.map((tx: any) => {
              const config = getTxTypeConfig(tx.txType);
              return (
                <div
                  key={tx.id}
                  className="rounded-xl border bg-card p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                  onClick={() => handleTxClick(tx)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${config.colorClass.split(" ")[1]}`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {t(`loan.tranxType.${config.label}`)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {tx.createdAt
                            ? new Date(tx.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base">
                        {formatCurrency(Number(tx.amount || 0))}
                      </p>
                      {!canEditOrDelete(tx) && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                          {t("loan.system.system")}
                        </span>
                      )}
                    </div>
                  </div>
                  {tx.note && (
                    <p className="text-xs text-muted-foreground line-clamp-1 border-t pt-2 mt-2">
                      {tx.note}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {hasNextPage && (
          <div className="flex justify-center p-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full sm:w-auto"
            >
              {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl p-0 overflow-scroll rounded-2xl max-h-[90vh]">
          {selectedTx && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center ${getTxTypeConfig(selectedTx.txType).colorClass.split(" ")[1]}`}
                    >
                      {getTxTypeConfig(selectedTx.txType).fullIcon}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold">
                        {t(
                          `loan.tranxType.${getTxTypeConfig(selectedTx.txType).label}`,
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">
                        {t(
                          `loan.tranxType.${getTxTypeConfig(selectedTx.txType).description}`,
                        )}
                      </DialogDescription>
                    </div>
                  </div>
                  <LastAudit
                    lastAudit={selectedTx.lastAuditLog as ILastAudit}
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-6">
                      <div className="bg-muted/30 p-5 rounded-2xl border border-muted-foreground/10">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-wider">
                          {t("loan.detail.tranx.totalAmt")}
                        </p>
                        <p
                          className={`text-3xl md:text-4xl font-black ${getTxTypeConfig(selectedTx.txType).colorClass.split(" ")[0]}`}
                        >
                          {formatCurrency(Number(selectedTx.amount || 0))}
                        </p>
                      </div>

                      {selectedTx.note && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                            <Info className="h-3 w-3" />{" "}
                            {t("loan.detail.tranx.note")}
                          </p>
                          <p className="text-sm text-muted-foreground italic bg-muted/10 p-3 rounded-xl border border-dashed">
                            "{selectedTx.note}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {(selectedTx.loanPayments?.length ?? 0) > 0 ||
                      selectedTx.loanCashPayment ? (
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <Wallet className="h-3 w-3" />{" "}
                            {t("loan.detail.tranx.paymentDetails")}
                          </p>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                            {selectedTx.loanPayments?.map((p: any) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted-foreground/5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <ArrowUpCircle className="h-4 w-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold truncate max-w-[120px]">
                                      {p.account?.name ||
                                        t("loan.detail.tranx.bankAcc")}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {p.account?.bank || "—"}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-bold text-sm">
                                  {formatCurrency(Number(p.amount))}
                                </p>
                              </div>
                            ))}
                            {selectedTx.loanCashPayment && (
                              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-muted-foreground/5">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                                    <Wallet className="h-4 w-4 text-secondary-foreground" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold">
                                      {t("loan.detail.tranx.cashPay")}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-bold text-sm">
                                  {formatCurrency(
                                    Number(selectedTx.loanCashPayment.amount),
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      <Separator className="opacity-50" />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />{" "}
                            {t("loan.detail.tranx.createdDate")}
                          </p>
                          <p className="text-sm font-medium">
                            {new Date(
                              selectedTx.createdAt || "",
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {selectedTx.dueDate && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />{" "}
                              {t("loan.detail.tranx.dueDate")}
                            </p>
                            <p className="text-sm font-medium text-red-600">
                              {new Date(
                                selectedTx.dueDate,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {(selectedTx.saleId || selectedTx.purchaseId) && (
                        <div className="pt-2">
                          <Badge
                            variant="outline"
                            className="h-9 px-4 rounded-xl gap-2 cursor-pointer hover:bg-muted/50 transition-colors w-full justify-center"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">
                              {selectedTx.saleId
                                ? t("loan.detail.tranx.linkToEntity", {
                                    entity: "Sale",
                                  })
                                : t("loan.detail.tranx.linkToEntity", {
                                    entity: "Purchase",
                                  })}
                            </span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 flex gap-3">
                {canEditOrDelete(selectedTx) ? (
                  <>
                    {hasEditAccess && (
                      <Button
                        className="flex-1 rounded-xl h-11"
                        onClick={() => handleEditTx(selectedTx)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
                      </Button>
                    )}
                    {hasDeleteAccess && (
                      <Button
                        variant="destructive"
                        className="flex-1 rounded-xl h-11"
                        onClick={() => handleDeleteTx(selectedTx)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex-1 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                    <Info className="h-5 w-5 text-amber-600" />
                    <p className="text-[10px] font-medium text-amber-800 leading-tight">
                      {t("loan.system.systemTranx")}
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11 sm:hidden"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  {t("common.close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {hasCreateAccess && (
        <Button
          className="fixed bottom-20 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden z-50 p-0"
          onClick={() => router.push(`/loan/${partnerId}/new`)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
