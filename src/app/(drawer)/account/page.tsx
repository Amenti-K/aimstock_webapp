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
import {
  Plus,
  Wallet,
  Eye,
  EyeOff,
  ChevronRight,
  Landmark,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
import { useLanguage } from "@/hooks/language.hook";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("ACCOUNT");
  const hasCreateAccess = canCreate("ACCOUNT");

  const [showTotalBalance, setShowTotalBalance] = useState(true);

  const { data, isLoading, isError, refetch } = useGetAccountsInfinite(
    {},
    hasViewAccess,
  );

  const { data: summaryData } = useGetSummary(hasViewAccess);

  const accounts = React.useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("accounts.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="relative min-h-screen pb-24 md:pb-8">
      <div className="space-y-6 max-w-7xl mx-auto p-2 sm:px-6 lg:px-8">
        {/* Header Section */}
        {!isMobile && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Landmark className="h-8 w-8 text-primary" />
                {t("accounts.moduleName")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("accounts.totalCard.subtitle")}
              </p>
            </motion.div>

            {hasCreateAccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  className="shadow-lg hover:shadow-primary/20 transition-all rounded-full px-6 py-6"
                  onClick={() => router.push("/account/new")}
                >
                  <Plus className="mr-2 h-5 w-5" /> {t("accounts.form.add")}
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-center"
        >
          <Card className="w-full max-w-2xl bg-gradient-to-br from-primary/20 via-background to-background border-primary/10 shadow-xl overflow-hidden backdrop-blur-sm">
            <CardContent>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-primary/15 text-primary shadow-inner">
                    <Wallet className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-1">
                      {t("accounts.totalCard.title")}
                    </p>
                    <div className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground tabular-nums">
                      {showTotalBalance
                        ? `${Number(summaryData?.totalBalance || 0).toLocaleString()} `
                        : "•••••• "}
                      <span className="text-lg font-medium text-muted-foreground ml-1">
                        ETB
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-2xl hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                  onClick={() => setShowTotalBalance(!showTotalBalance)}
                >
                  {showTotalBalance ? (
                    <Eye className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-6 w-6 text-primary" />
                  )}
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-primary/5 pt-4">
                <p className="text-xs font-medium text-muted-foreground flex items-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                  {accounts.length} {t("accounts.moduleName").toLowerCase()}
                </p>
                <div className="flex -space-x-2">
                  {accounts
                    .slice(0, 3)
                    .map((acc: IAccountDetail, i: number) => (
                      <div
                        key={acc.id}
                        className="border-2 border-background rounded-full overflow-hidden"
                        style={{ zIndex: 3 - i }}
                      >
                        <BankAvatar name={acc.bank} type={acc.type} size={24} />
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* List Section */}
        <div>
          {accounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 bg-card rounded-3xl border-2 border-dashed border-muted/50 p-8 text-center"
            >
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Wallet className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {t("accounts.emptyAcconts")}
              </p>
              {hasCreateAccess && (
                <Button
                  variant="link"
                  className="mt-2 text-primary font-bold"
                  onClick={() => router.push("/account/new")}
                >
                  {t("accounts.form.add")}
                </Button>
              )}
            </motion.div>
          ) : isMobile ? (
            /* Mobile Card View */
            <div className="grid grid-cols-1 gap-2">
              <AnimatePresence mode="popLayout">
                {accounts.map((acc: IAccountDetail, index: number) => (
                  <motion.div
                    key={acc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/account/${acc.id}`)}
                  >
                    <Card className="active:scale-[0.98] p-0 transition-transform overflow-hidden border-primary/5 shadow-md">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <BankAvatar
                            name={acc.bank}
                            type={acc.type}
                            size={52}
                          />
                          <div className="flex flex-col">
                            <h3 className="font-bold text-base text-foreground line-clamp-1">
                              {acc.name}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              {acc.type === "Cash"
                                ? t("accounts.accountCard.cash")
                                : acc.bank
                                  ? t(`accounts.bank.${acc.bank}`)
                                  : "---"}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider font-medium">
                              {acc.type === "Cash"
                                ? "Internal Vault"
                                : acc.number || "•••• ••••"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-base font-black text-foreground tabular-nums">
                            {showTotalBalance
                              ? Number(acc.balance).toLocaleString()
                              : "••••"}
                            <span className="text-[10px] font-bold text-muted-foreground ml-1">
                              ETB
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-primary/40" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Desktop Table View */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-3xl border shadow-xl overflow-hidden"
            >
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold py-6 pl-8 text-foreground/70 uppercase text-[10px] tracking-widest">
                      {t("accounts.accountCard.holder")}
                    </TableHead>
                    <TableHead className="font-bold py-6 text-foreground/70 uppercase text-[10px] tracking-widest">
                      {t("accounts.accountCard.branch")}
                    </TableHead>
                    <TableHead className="font-bold py-6 text-right pr-12 text-foreground/70 uppercase text-[10px] tracking-widest">
                      {t("accounts.accountCard.balance")}
                    </TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc: IAccountDetail) => (
                    <TableRow
                      key={acc.id}
                      className="cursor-pointer group transition-all hover:bg-primary/5 border-b border-muted/50 last:border-0"
                      onClick={() => router.push(`/account/${acc.id}`)}
                    >
                      <TableCell className="py-6 pl-8">
                        <div className="flex items-center gap-4">
                          <BankAvatar
                            name={acc.bank}
                            type={acc.type}
                            size={44}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                              {acc.name}
                            </span>
                            <span className="text-xs text-muted-foreground/80">
                              {acc.type === "Cash"
                                ? "Cash Account"
                                : acc.number || ""}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground/90">
                            {acc.type === "Cash"
                              ? t("accounts.accountCard.cash")
                              : acc.bank
                                ? t(`accounts.bank.${acc.bank}`)
                                : "---"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {acc.type === "Cash"
                              ? "Internal"
                              : acc.branch || "General Branch"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-right pr-12">
                        <div className="text-base font-black text-foreground tabular-nums">
                          {showTotalBalance
                            ? `${Number(acc.balance).toLocaleString()} `
                            : "•••••• "}
                          <span className="text-[10px] font-bold text-muted-foreground ml-0.5">
                            ETB
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 pr-6 text-right">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/5 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && hasCreateAccess && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            size="icon"
            className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 transition-all scale-105"
            onClick={() => router.push("/account/new")}
          >
            <Plus className="h-8 w-8 text-white" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
