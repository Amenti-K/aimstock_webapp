"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Warehouse,
  MapPin,
  Phone,
  Boxes,
  ArrowUpRight,
  History,
  ShoppingBag,
  ShoppingCart,
  MoreVertical,
  ChevronRight,
  Info,
  Package,
} from "lucide-react";
import {
  useDeleteWarehouse,
  useFetchWarehouseById,
} from "@/api/warehouse/api.warehouse";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatter";
import LastAudit from "@/components/audit/LastAudit";

export default function WarehouseDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const warehouseId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);

  const hasViewAccess = canView("WAREHOUSES");
  const hasUpdateAccess = canUpdate("WAREHOUSES");
  const hasDeleteAccess = canDelete("WAREHOUSES");

  const { data, isLoading, isError, refetch } = useFetchWarehouseById(
    warehouseId,
    hasViewAccess,
  );
  const deleteWarehouse = useDeleteWarehouse();

  const aggregatedTransactions = useMemo(() => {
    if (!data?.data) return [];

    const warehouse = data.data;
    const purchases = (warehouse.purchaseItems || []).map((p) => ({
      ...p,
      type: "PURCHASE",
    }));
    const sales = (warehouse.saleItems || []).map((s) => ({
      ...s,
      type: "SALE",
    }));
    return [...purchases, ...sales].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data?.data]);

  if (!hasViewAccess)
    return <AccessDeniedView moduleName={t("warehouse.moduleName")} />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const warehouse = data.data;

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
            {t("common.back")} to {t("warehouse.moduleName")}
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
                onClick={() => router.push(`/warehouse/${warehouseId}/edit`)}
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
                    onClick={() =>
                      router.push(`/warehouse/${warehouseId}/edit`)
                    }
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
              lastAudit={warehouse.lastAuditLog}
              className="rounded-none rounded-b-2xl border-none shadow-none bg-muted/30 backdrop-blur-md px-4 py-1"
            />
          </div>

          <CardContent className="p-8 pl-12">
            <div className="flex flex-col gap-8">
              <div>
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  {t("warehouse.moduleName")}
                </span>
                <div className="flex items-center gap-3 mt-2 flex-wrap pr-16 sm:pr-32">
                  <h2 className="text-3xl font-black tracking-tight text-foreground">
                    {warehouse.name}
                  </h2>
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 text-[10px] font-black border transition-all",
                      warehouse.isInternal
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    )}
                    variant="outline"
                  >
                    {warehouse.isInternal
                      ? t("warehouse.card.isInternal").toUpperCase()
                      : t("warehouse.card.isExternal").toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 group">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20 transition-transform group-hover:scale-105">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("warehouse.form.location")}
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                      {warehouse.location || t("common.notSpecified")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 shrink-0 border border-orange-500/20 transition-transform group-hover:scale-105">
                    <Phone className="h-7 w-7" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      {t("warehouse.form.contactPhone")}
                    </span>
                    <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                      {warehouse.contactPhone || t("common.noContact")}
                    </span>
                  </div>
                </div>
              </div>

              {warehouse.description && (
                <div className="flex flex-col gap-2 pt-4 border-t border-muted">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Info className="h-3.5 w-3.5" />
                    {t("warehouse.form.description")}
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    {warehouse.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </div>

        {/* Transaction Summary Card */}
        <div className="lg:col-span-4 bg-card rounded-[1.8rem] border shadow-sm p-6 flex flex-col justify-between transition-all hover:shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12">
            <History className="h-32 w-32" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-[0.15em]">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <History className="h-3.5 w-3.5" />
              </div>
              {t("warehouse.detail.tab.transactions")}
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Total Transactions
              </span>
              <span className="text-4xl font-black text-primary tracking-tighter">
                {(warehouse.purchaseItems?.length || 0) +
                  (warehouse.saleItems?.length || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
            <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/10 hover:bg-green-500/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-green-500/20 text-green-600">
                  <ShoppingBag className="h-3 w-3" />
                </div>
                <span className="text-[9px] font-black text-green-700/70 uppercase">
                  {t("common.layout.header.sales")}
                </span>
              </div>
              <span className="text-2xl font-black text-green-600">
                {warehouse.saleItems?.length || 0}
              </span>
            </div>

            <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-600">
                  <ShoppingCart className="h-3 w-3" />
                </div>
                <span className="text-[9px] font-black text-blue-700/70 uppercase">
                  {t("common.layout.header.purchase")}
                </span>
              </div>
              <span className="text-2xl font-black text-blue-600">
                {warehouse.purchaseItems?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Data Section */}
      <div className="space-y-6">
        <Tabs defaultValue="inventory" className="w-full">
          <div className="flex justify-start mb-6">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-12 w-full max-w-md border border-muted-foreground/10 shadow-inner">
              <TabsTrigger
                value="inventory"
                className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-6 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 data-[state=active]:text-primary"
              >
                <Boxes className="h-4 w-4" />
                {t("warehouse.detail.tab.items")}
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md px-6 font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 data-[state=active]:text-primary"
              >
                <History className="h-4 w-4" />
                {t("warehouse.detail.tab.transactions")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Inventory Content */}
          <TabsContent value="inventory" className="space-y-4 outline-none">
            <div className="hidden md:block bg-card rounded-3xl overflow-hidden shadow-sm border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("inventory.card.name")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("inventory.card.sku")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      {t("inventory.card.quantity")}
                    </TableHead>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                      {t("inventory.table.status")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(warehouse.warehouseInventories ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                          <Package className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold tracking-tight">
                            {t("warehouse.detail.tab.noItems")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    warehouse.warehouseInventories.map((item: any) => {
                      const lowStock =
                        Number(item.quantity) <= Number(item.reorderQuantity);
                      const outOfStock = Number(item.quantity) <= 0;

                      return (
                        <TableRow
                          key={item.id}
                          className="hover:bg-primary/5 cursor-pointer group transition-colors"
                          onClick={() =>
                            router.push(`/inventory/${item.inventory?.id}`)
                          }
                        >
                          <TableCell className="px-6 py-4 font-bold text-sm">
                            {item.inventory?.name || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge
                              variant="outline"
                              className="font-mono text-[9px] px-2 py-0.5 rounded-lg bg-muted/50 border-muted-foreground/20 text-muted-foreground"
                            >
                              {item.inventory?.sku || "NO-SKU"}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span
                                className={cn(
                                  "text-base font-black leading-none mb-1",
                                  outOfStock
                                    ? "text-destructive"
                                    : lowStock
                                      ? "text-orange-500"
                                      : "text-primary",
                                )}
                              >
                                {item.quantity.toLocaleString()}
                              </span>
                              <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
                                {item.inventory?.unit || "Units"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            {outOfStock ? (
                              <Badge
                                variant="destructive"
                                className="rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-tighter"
                              >
                                {t("inventory.card.outOfStock")}
                              </Badge>
                            ) : lowStock ? (
                              <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100 border-none rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-tighter">
                                {t("warehouse.detail.tab.lowStock")}
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-tighter">
                                {t("inventory.card.inStock")}
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

            {/* Mobile Inventory Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {(warehouse.warehouseInventories ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                  <Package className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">
                    {t("warehouse.detail.tab.noItems")}
                  </p>
                </div>
              ) : (
                warehouse.warehouseInventories.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      router.push(`/inventory/${item.inventory?.id}`)
                    }
                    className="bg-card p-5 rounded-3xl shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-base">
                        {item.inventory?.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="font-mono text-[9px] px-2 py-0 border-muted-foreground/20 text-muted-foreground"
                      >
                        {item.inventory?.sku || "NO-SKU"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60 mb-1">
                            {t("inventory.card.quantity")}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={cn(
                                "text-xl font-black",
                                item.quantity <= 0
                                  ? "text-destructive"
                                  : item.quantity <= item.reorderQuantity
                                    ? "text-orange-500"
                                    : "text-primary",
                              )}
                            >
                              {item.quantity.toLocaleString()}
                            </span>
                            <span className="text-[9px] font-black text-muted-foreground uppercase">
                              {item.inventory?.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Transactions Content */}
          <TabsContent value="transactions" className="space-y-4 outline-none">
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
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("common.trade.referenceId")}
                    </TableHead>
                    <TableHead className="w-10 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aggregatedTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
                          <History className="h-12 w-12 mb-4 opacity-20" />
                          <p className="text-sm font-bold tracking-tight">
                            {t("warehouse.detail.tab.noTransactions")}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    aggregatedTransactions.map((tx: any) => (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-primary/5 cursor-pointer group transition-colors"
                        onClick={() =>
                          router.push(
                            `/${tx.type.toLowerCase() === "purchase" ? "purchase" : "sales"}/${tx.id}`,
                          )
                        }
                      >
                        <TableCell className="px-6 py-4 font-bold text-sm">
                          {formatDate(tx.createdAt)}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] font-black uppercase rounded-full px-3 py-0.5 tracking-wider border-none",
                              tx.type === "SALE"
                                ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                                : "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {tx.type === "SALE" ? (
                                <ShoppingBag className="h-3 w-3" />
                              ) : (
                                <ShoppingCart className="h-3 w-3" />
                              )}
                              {tx.type === "SALE"
                                ? t("common.layout.header.sales")
                                : t("common.layout.header.purchase")}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <code className="text-[9px] font-mono bg-muted/50 px-2 py-1 rounded-lg text-muted-foreground">
                            #{tx.id.slice(-8).toUpperCase()}
                          </code>
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

            {/* Mobile Transaction Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {aggregatedTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                  <History className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">
                    {t("warehouse.detail.tab.noTransactions")}
                  </p>
                </div>
              ) : (
                aggregatedTransactions.map((tx: any) => (
                  <div
                    key={tx.id}
                    onClick={() =>
                      router.push(
                        `/${tx.type.toLowerCase() === "purchase" ? "purchase" : "sales"}/${tx.id}`,
                      )
                    }
                    className="bg-card p-5 rounded-3xl shadow-sm border border-primary/5 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={cn(
                          "text-[9px] font-black uppercase rounded-full px-3 py-1 border-none",
                          tx.type === "SALE"
                            ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                            : "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          {tx.type === "SALE" ? (
                            <ShoppingBag className="h-3 w-3" />
                          ) : (
                            <ShoppingCart className="h-3 w-3" />
                          )}
                          {tx.type === "SALE"
                            ? t("common.layout.header.sales")
                            : t("common.layout.header.purchase")}
                        </div>
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <code className="text-[9px] font-mono bg-muted/50 px-2 py-1 rounded-lg text-muted-foreground">
                        #{tx.id.slice(-8).toUpperCase()}
                      </code>
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
                entity: t("warehouse.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed">
              {t("common.confirmDelete.message", {
                entity: t("warehouse.moduleName"),
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
                deleteWarehouse.mutate({ id: warehouseId } as any, {
                  onSuccess: () => router.push("/warehouse"),
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
