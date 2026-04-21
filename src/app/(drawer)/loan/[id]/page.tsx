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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import {
  useGetLoanTransactionsInfinite,
  useDeleteLoanTx,
} from "@/api/loan/api.loan";
import { LoanTxType, ILoanTranx } from "@/components/interface/loan/loan.interface";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoanTransactionForm from "@/components/forms/loan/LoanTransactionForm";

const formatTxType = (type: string) => {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

export default function LoanDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const partnerId = params.id as string;
  const partnerName = searchParams.get("name") || "Partner";
  const partnerPhone = searchParams.get("phone") || "—";
  const partnerBalanceStr = searchParams.get("balance") || "0";
  const partnerBalance = Number(partnerBalanceStr);

  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("LOANS");
  const hasCreateAccess = canCreate("LOANS");
  const hasEditAccess = canUpdate("LOANS");
  const hasDeleteAccess = canDelete("LOANS");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<ILoanTranx | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

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

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Loans" />;
  }

  const isPositiveBalance = partnerBalance > 0;

  const handleAddTx = () => {
    setModalMode("add");
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const handleEditTx = (tx: ILoanTranx) => {
    setModalMode("edit");
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  const handleDeleteTx = (tx: ILoanTranx) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTxMutate.mutate({ id: tx.id });
    }
  };

  const canEditOrDelete = (tx: ILoanTranx) => {
    return (
      tx.txType !== LoanTxType.SALE_FINANCING &&
      tx.txType !== LoanTxType.PURCHASE_FINANCING
    );
  };

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{partnerName}</h1>
          <p className="text-sm text-muted-foreground">Phone: {partnerPhone}</p>
        </div>
        {hasCreateAccess && (
          <Button onClick={handleAddTx}>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
              Current Balance
            </h3>
          </div>
          <div className="p-6 pt-0 flex items-center justify-between">
            <div
              className={`text-3xl font-bold ${isPositiveBalance ? "text-emerald-600" : partnerBalance < 0 ? "text-red-600" : ""}`}
            >
              Br {Math.abs(partnerBalance).toLocaleString()}
            </div>
            {partnerBalance !== 0 && (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  isPositiveBalance
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isPositiveBalance ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {isPositiveBalance ? "Partner Owes Us" : "We Owe Partner"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card mt-8">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Transaction Ledger
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <p>No transactions found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {tx.createdAt
                      ? new Date(tx.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                      {formatTxType(tx.txType)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    Br {Number(tx.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm truncate max-w-[200px] inline-block"
                      title={tx.note}
                    >
                      {tx.note || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {canEditOrDelete(tx) ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {hasEditAccess && (
                            <DropdownMenuItem onClick={() => handleEditTx(tx)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          {hasDeleteAccess && (
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeleteTx(tx)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        System
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasNextPage && (
          <div className="flex justify-center p-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading more..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "add" ? "Add Transaction" : "Edit Transaction"}
            </DialogTitle>
          </DialogHeader>
          {isModalOpen && (
            <LoanTransactionForm
              partnerId={partnerId}
              mode={modalMode}
              data={selectedTx}
              onSuccess={() => {
                setIsModalOpen(false);
                refetch();
              }}
              onCancel={() => setIsModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
