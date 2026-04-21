"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAccount,
  useTransferFunds,
  useFetchAccountSelector,
  useUpdateAccount,
  useDeleteAccount,
} from "@/api/account/api.account";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  Building2,
  Hash,
  Pencil,
  Trash2,
  ShoppingBag,
  TrendingUp,
  Receipt,
  HandCoins,
  History,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import TransferFundsForm from "@/components/forms/account/TransferFundsForm";
import AccountForm from "@/components/forms/account/AccountForm";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatter";
import { usePermissions } from "@/hooks/permission.hook";
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
import { BankAvatar } from "@/components/account/BankAvatar";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const hasUpdateAccess = canUpdate("ACCOUNT");
  const hasDeleteAccess = canDelete("ACCOUNT");

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const {
    data: accountData,
    isLoading,
    isError,
    refetch,
  } = useGetAccount(id as string);
  const { data: accountsData } = useFetchAccountSelector();
  const transferFunds = useTransferFunds();
  const updateAccount = useUpdateAccount();
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

  const handleUpdate = (formData: any) => {
    updateAccount.mutate(formData, {
      onSuccess: () => {
        setIsEditOpen(false);
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
          router.push("/app/account");
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {account.name}
              </h1>
              {/* <Badge variant={account.isActive ? "default" : "secondary"} className="rounded-full px-3">
                  {account.isActive ? "Active" : "Inactive"}
               </Badge> */}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Account Overview & Transaction History
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isCashAccount && hasUpdateAccess && (
            <Button
              variant="outline"
              className="rounded-full px-5"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {!isCashAccount && hasDeleteAccess && (
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 border-destructive/20 rounded-full px-5"
              onClick={() => setIsDeleteAlertOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          <Button
            className="rounded-full px-6 shadow-sm"
            onClick={() => setIsTransferOpen(true)}
          >
            <ArrowLeftRight className="mr-2 h-4 w-4" /> Transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden border-none shadow-md bg-card relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-lg font-bold">
              Account Information
            </CardTitle>
            <CardDescription>
              Details for your {account.type} account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-muted/50 text-primary border border-primary/5">
                  <BankAvatar
                    name={account.bank}
                    type={account.type}
                    size={44}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight mb-1">
                    Financial Institution
                  </p>
                  <p className="font-bold text-lg capitalize leading-none">
                    {account.bank?.toLowerCase().replace(/_/g, " ") ||
                      "Internal"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-muted/50 text-primary border border-primary/5">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight mb-1">
                    Account Number
                  </p>
                  <p className="font-mono text-lg font-bold leading-none">
                    {account.number || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center lg:items-end bg-primary/5 rounded-3xl p-6 border border-primary/10">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                Available Balance
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl xs:text-5xl font-black text-primary tracking-tighter">
                  {Number(account.balance).toLocaleString()}
                </span>
                <span className="text-base font-medium opacity-70 text-primary uppercase">ETB</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Balance
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-none lg:h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Activity Volume</CardTitle>
            <CardDescription>Lifetime summary</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 flex-grow">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/5 dark:border-emerald-500/10 group hover:scale-[1.02] transition-transform">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-tight">
                  Total Inflow
                </p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                  +
                  {Number(
                    transactions
                      .filter((t: any) => t.direction === "in")
                      .reduce(
                        (acc: number, t: any) => acc + Number(t.amount),
                        0,
                      ),
                  ).toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-500/10 p-2 rounded-xl">
                 <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="flex justify-between items-center p-4 rounded-2xl bg-rose-50 border border-rose-100 dark:bg-rose-500/5 dark:border-rose-500/10 group hover:scale-[1.02] transition-transform">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-tight">
                  Total Outflow
                </p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400">
                  -
                  {Number(
                    transactions
                      .filter((t: any) => t.direction === "out")
                      .reduce(
                        (acc: number, t: any) => acc + Number(t.amount),
                        0,
                      ),
                  ).toLocaleString()}
                </p>
              </div>
              <div className="bg-rose-500/10 p-2 rounded-xl">
                 <TrendingUp className="h-6 w-6 text-rose-500 rotate-180" />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2 text-muted-foreground border-t border-dashed mt-auto">
              <History className="h-4 w-4 opacity-50" />
              <span className="text-xs font-medium">
                {transactions.length} Transactions recorded
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-none overflow-hidden sm:rounded-2xl mt-6">
        <CardHeader className="bg-muted/30 flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg font-bold">
              Recent Transactions
            </CardTitle>
            <CardDescription>Last activities on this account</CardDescription>
          </div>
          <Badge variant="outline" className="bg-background/50 border-muted-foreground/10 px-3 font-semibold rounded-full hidden sm:flex">
             {transactions.length} Records
          </Badge>
        </CardHeader>
        <CardContent className="p-0 sm:p-2">
          {/* Card list for mobile (hidden on medium-up) */}
          <div className="block sm:hidden divide-y divide-muted-foreground/10 px-4">
             {transactions.length === 0 ? (
               <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <History className="h-10 w-10 opacity-20" />
                  <p>No transactions found.</p>
               </div>
             ) : (
               transactions.map((tx: any) => (
                 <div key={tx.id} className="py-5 group active:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-muted group-active:bg-background">
                             {getTransactionIcon(tx.source)}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-sm capitalize">{tx.source.replace(/_/g, " ")}</span>
                             <span className="text-[10px] text-muted-foreground font-semibold">{formatDate(tx.createdAt)}</span>
                          </div>
                       </div>
                       <Badge variant="outline" className={`text-[10px] h-4.5 px-1.5 rounded-sm font-bold border-none ${tx.direction === "in" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                          {tx.direction === "in" ? "RECEIVED" : "SENT"}
                       </Badge>
                    </div>
                    
                    <div className="flex justify-between items-end gap-4 pl-12">
                       <div className="flex flex-col gap-1 overflow-hidden">
                          <p className="text-xs font-medium text-foreground line-clamp-1">{tx.description || "No description"}</p>
                          <p className="text-[10px] text-muted-foreground font-bold truncate">Partner: {tx.relatedName || "Generic"}</p>
                       </div>
                       <p className={`text-base font-black whitespace-nowrap ${tx.direction === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                          {tx.direction === "in" ? "+" : "-"} {Number(tx.amount).toLocaleString()}
                       </p>
                    </div>
                 </div>
               ))
             )}
          </div>

          {/* Table for larger screens (hidden on mobile) */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader className="bg-muted/50 border-none">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold py-4 pl-6 text-xs uppercase tracking-wider text-muted-foreground/70">Transaction</TableHead>
                  <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-muted-foreground/70">Description</TableHead>
                  <TableHead className="font-bold py-4 text-xs uppercase tracking-wider text-muted-foreground/70">Related Party</TableHead>
                  <TableHead className="font-bold py-4 text-right text-xs uppercase tracking-wider text-muted-foreground/70">Amount</TableHead>
                  <TableHead className="font-bold py-4 text-center pr-6 text-xs uppercase tracking-wider text-muted-foreground/70">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-48 text-center text-muted-foreground border-none"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-10 w-10 opacity-20" />
                        <p>No transactions found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow
                      key={tx.id}
                      className="hover:bg-muted/30 transition-colors border-muted-foreground/10 group"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-muted flex items-center justify-center shadow-sm border border-black/5 group-hover:bg-background transition-colors">
                            {getTransactionIcon(tx.source)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm capitalize group-hover:text-primary transition-colors">
                              {tx.source.replace(/_/g, " ")}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] h-4 px-1.5 w-fit rounded-sm font-bold border-none ${tx.direction === "in" ? "text-emerald-600 bg-emerald-50/50" : "text-rose-600 bg-rose-50/50"}`}
                            >
                              {tx.direction === "in" ? "RECEIVE" : "SEND"}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-medium text-xs sm:text-sm text-foreground/80 max-w-[200px]">
                        <p className="line-clamp-1">{tx.description || "-"}</p>
                      </TableCell>
                      <TableCell className="py-4 font-bold text-xs sm:text-sm text-muted-foreground">
                        {tx.relatedName || "Generic"}
                      </TableCell>
                      <TableCell
                        className={`py-4 text-right font-black text-sm sm:text-lg tabular-nums ${tx.direction === "in" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {tx.direction === "in" ? "+" : "-"} {Number(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 text-center pr-6">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-black opacity-30 uppercase tracking-widest hidden lg:block">
                            VERIFIED
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Dialog */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Transfer Funds
            </DialogTitle>
          </DialogHeader>
          <TransferFundsForm
            fromAccountId={account.id}
            accounts={accounts}
            onTransfer={handleTransfer}
            loading={transferFunds.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Edit Account
            </DialogTitle>
          </DialogHeader>
          <AccountForm
            mode="edit"
            data={account}
            onSave={handleUpdate}
            loading={updateAccount.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">
                "{account.name}"
              </span>
              ? This will remove all associated transaction history. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full px-6"
              onClick={handleDelete}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
