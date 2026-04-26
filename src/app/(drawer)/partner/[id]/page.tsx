"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  ShoppingCart,
  HandCoins,
  ArrowUpRight,
  TrendingUp,
  History,
  MoreVertical,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  useDeletePartner,
  useFetchPartnerById,
} from "@/api/partner/api.partner";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import LastAudit from "@/components/audit/LastAudit";

export default function PartnerDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const partnerId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = useState(false);

  const hasViewAccess = canView("PARTNERS");
  const hasUpdateAccess = canUpdate("PARTNERS");
  const hasDeleteAccess = canDelete("PARTNERS");

  const { data, isLoading, isError, refetch } = useFetchPartnerById(
    partnerId,
    hasViewAccess,
  );
  const deletePartner = useDeletePartner();

  const totals = useMemo(() => {
    if (!data?.data) return { sales: 0, purchases: 0, loans: 0 };
    const partner = data.data;

    const sales =
      partner.sale?.reduce(
        (acc: number, s: any) => acc + (Number(s.total) || 0),
        0,
      ) || 0;
    const purchases =
      partner.purchases?.reduce(
        (acc: number, p: any) => acc + (Number(p.total) || 0),
        0,
      ) || 0;
    const loans =
      partner.loans?.reduce(
        (acc: number, l: any) => acc + (Number(l.amount) || 0),
        0,
      ) || 0;

    return { sales, purchases, loans };
  }, [data?.data]);

  if (!hasViewAccess)
    return <AccessDeniedView moduleName={t("partners.moduleName")} />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const partner = data.data;
  const {
    sales: totalSales,
    purchases: totalPurchases,
    loans: totalLoans,
  } = totals;

  return (
    <div className="space-y-8 pb-12">
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
            {t("common.back")} to {t("partners.moduleName")}
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
                onClick={() => router.push(`/partner/${partnerId}/edit`)}
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
                    onClick={() => router.push(`/partner/${partnerId}/edit`)}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Overview Card */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-[1.8rem] border bg-card shadow-sm transition-all hover:shadow-md">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
          <div className="absolute top-0 right-0 z-10">
            <LastAudit
              lastAudit={partner.lastAuditLog}
              className="rounded-none rounded-b-2xl border-none shadow-none bg-muted/30 backdrop-blur-md px-4 py-1"
            />
          </div>

          <CardContent className="p-8 pl-12">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-2xl border-2 border-background shadow-lg">
                  <AvatarFallback className="bg-primary/5 text-primary">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {t("partners.moduleName")}
                  </span>
                  <h2 className="text-3xl font-black tracking-tight text-foreground mt-1">
                    {partner.name}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 group">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20 transition-transform group-hover:scale-105">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("partners.card.address")}
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                      {partner.address || t("common.notSpecified")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 shrink-0 border border-orange-500/20 transition-transform group-hover:scale-105">
                    <Phone className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("partners.card.phoneNum")}
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                      {partner.phone || t("common.noContact")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Performance Summary Card */}
        <div className="lg:col-span-4 bg-slate-900 dark:bg-card rounded-[1.8rem] border border-slate-800 shadow-xl p-8 flex flex-col justify-between transition-all hover:shadow-2xl relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] transition-transform group-hover:scale-110 group-hover:rotate-12">
            <TrendingUp className="h-32 w-32" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.15em]">
              <div className="p-1.5 rounded-lg bg-primary text-white">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              {t("common.trade.financialOverview")}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {t("common.trade.total")} Volume
              </span>
              <span className="text-4xl font-black text-white tracking-tighter">
                {formatCurrency(totalSales + totalPurchases)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-500 uppercase">
                {t("common.layout.header.sales")}
              </span>
              <span className="text-base font-black text-green-400">
                {formatCurrency(totalSales)}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
              <span className="text-[9px] font-black text-slate-500 uppercase">
                {t("common.layout.header.purchase")}
              </span>
              <span className="text-base font-black text-blue-400">
                {formatCurrency(totalPurchases)}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
              <span className="text-[9px] font-black text-slate-500 uppercase">
                {t("partners.detail.tab.loan")}
              </span>
              <span className="text-base font-black text-yellow-400">
                {formatCurrency(totalLoans)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Data Section */}
      <div className="space-y-6">
        <Tabs defaultValue="sales" className="w-full">
          <div className="flex justify-start">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-12 w-full max-w-md border border-muted-foreground/10 shadow-inner">
              <TabsTrigger
                value="sales"
                className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-6 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 data-[state=active]:text-primary"
              >
                <ShoppingBag className="h-4 w-4" />
                {t("partners.detail.tab.sale")}
              </TabsTrigger>
              <TabsTrigger
                value="purchases"
                className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-6 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 data-[state=active]:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("partners.detail.tab.pur")}
              </TabsTrigger>
              <TabsTrigger
                value="loans"
                className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-6 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 data-[state=active]:text-primary"
              >
                <HandCoins className="h-4 w-4" />
                {t("partners.detail.tab.loan")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Sales Content */}
          <TabsContent value="sales" className="space-y-4 outline-none">
            <div className="hidden md:block bg-card rounded-3xl overflow-hidden shadow-sm border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.date")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.trade.description")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      {t("common.trade.total")}
                    </TableHead>
                    <TableHead className="w-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(partner.sale ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                          <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold tracking-tight">
                            {t("partners.detail.tab.noSales")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    partner.sale.map((s: any) => (
                      <TableRow
                        key={s.id}
                        className="hover:bg-primary/5 cursor-pointer group transition-colors"
                        onClick={() => router.push(`/sales/${s.id}`)}
                      >
                        <TableCell className="px-6 py-4 font-bold text-sm">
                          {formatDate(s.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                          {s.description || t("common.notSpecified")}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-black text-primary">
                          {formatCurrency(s.total)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Sales Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {(partner.sale ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">
                    {t("partners.detail.tab.noSales")}
                  </p>
                </div>
              ) : (
                partner.sale.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/sales/${s.id}`)}
                    className="bg-card p-5 rounded-3xl shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {formatDate(s.createdAt)}
                      </span>
                      <code className="text-[9px] font-mono bg-muted/50 px-2 py-1 rounded-lg text-muted-foreground">
                        #{s.id.slice(-8).toUpperCase()}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-primary">
                        {formatCurrency(s.total)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Purchases Content */}
          <TabsContent value="purchases" className="space-y-4 outline-none">
            <div className="hidden md:block bg-card rounded-3xl overflow-hidden shadow-sm border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.date")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.trade.description")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      {t("common.trade.total")}
                    </TableHead>
                    <TableHead className="w-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(partner.purchases ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                          <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold tracking-tight">
                            {t("partners.detail.tab.noPurchases")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    partner.purchases.map((p: any) => (
                      <TableRow
                        key={p.id}
                        className="hover:bg-primary/5 cursor-pointer group transition-colors"
                        onClick={() => router.push(`/purchase/${p.id}`)}
                      >
                        <TableCell className="px-6 py-4 font-bold text-sm">
                          {formatDate(p.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                          {p.description || t("common.notSpecified")}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-black text-primary">
                          {formatCurrency(p.total)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Purchases Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {(partner.purchases ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">
                    {t("partners.detail.tab.noPurchases")}
                  </p>
                </div>
              ) : (
                partner.purchases.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/purchase/${p.id}`)}
                    className="bg-card p-5 rounded-3xl shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {formatDate(p.createdAt)}
                      </span>
                      <code className="text-[9px] font-mono bg-muted/50 px-2 py-1 rounded-lg text-muted-foreground">
                        #{p.id.slice(-8).toUpperCase()}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-primary">
                        {formatCurrency(p.total)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Loans Content */}
          <TabsContent value="loans" className="space-y-4 outline-none">
            <div className="hidden md:block bg-card rounded-3xl overflow-hidden shadow-sm border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.date")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.type")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      {t("common.trade.total")}
                    </TableHead>
                    <TableHead className="w-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(partner.loans ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                          <HandCoins className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold tracking-tight">
                            {t("partners.detail.tab.noLoans")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    partner.loans.map((l: any) => (
                      <TableRow
                        key={l.id}
                        className="hover:bg-primary/5 cursor-pointer group transition-colors"
                        onClick={() => router.push(`/loan/${partnerId}`)}
                      >
                        <TableCell className="px-6 py-4 font-bold text-sm">
                          {formatDate(l.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className="text-[9px] font-black uppercase rounded-full px-3 py-0.5 tracking-wider bg-muted/50 border-none"
                          >
                            {l.txType.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right font-black text-primary">
                          {formatCurrency(l.amount)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Loans Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {(partner.loans ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                  <HandCoins className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">
                    {t("partners.detail.tab.noLoans")}
                  </p>
                </div>
              ) : (
                partner.loans.map((l: any) => (
                  <div
                    key={l.id}
                    onClick={() => router.push(`/loan/${partnerId}`)}
                    className="bg-card p-5 rounded-3xl shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {formatDate(l.createdAt)}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] font-black uppercase rounded-full px-2 py-0 border-none bg-muted/50"
                      >
                        {l.txType.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-primary">
                        {formatCurrency(l.amount)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">
              {t("common.confirmDelete.title", {
                entity: t("partners.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed">
              {t("common.confirmDelete.message", {
                entity: t("partners.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-2xl font-bold h-11 flex-1 border-primary/10 hover:bg-primary/5">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-bold h-11 flex-1 shadow-lg shadow-destructive/20"
              onClick={() =>
                deletePartner.mutate({ id: partnerId } as any, {
                  onSuccess: () => router.push("/partner"),
                })
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
