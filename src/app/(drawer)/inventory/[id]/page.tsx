"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Boxes,
  Warehouse,
  ChartColumnIncreasing,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  History,
  ShieldCheck,
  AlertTriangle,
  LayoutGrid,
  MoreVertical,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import {
  useDeleteInventory,
  useFetchInventory,
} from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { formatCurrency } from "@/lib/formatter";
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
import { cn } from "@/lib/utils";
import LastAudit from "@/components/audit/LastAudit";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const inventoryId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const hasUpdateAccess = canUpdate("INVENTORY");
  const hasDeleteAccess = canDelete("INVENTORY");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const { data, isLoading, isError, refetch } = useFetchInventory(
    inventoryId,
    hasViewAccess,
  );
  const deleteInventory = useDeleteInventory();

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const inventory = data.data;
  const totalQuantity = (inventory.warehouseInventories ?? []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const totalReorderQuantity = (inventory.warehouseInventories ?? []).reduce(
    (sum, item) => sum + Number(item.reorderQuantity || 0),
    0,
  );
  const valuation = Number(inventory.boughtPrice || 0) * totalQuantity;
  const profitMargin =
    Number(inventory.sellingPrice || 0) > 0
      ? ((Number(inventory.sellingPrice || 0) -
          Number(inventory.boughtPrice || 0)) /
          Number(inventory.sellingPrice || 0)) *
        100
      : 0;

  const lowStock = totalQuantity <= totalReorderQuantity;
  const outOfStock = totalQuantity <= 0;

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
            {t("common.back")} to {t("inventory.moduleName")}
          </span>
          <span className="sm:hidden">{t("common.back")}</span>
        </Button>

        {/* Actions Overlay */}
        <div className="z-20 flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {hasUpdateAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-background/50 backdrop-blur-sm shadow-sm border-none hover:bg-muted"
                onClick={() => router.push(`/inventory/${inventoryId}/edit`)}
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
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
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
                      router.push(`/inventory/${inventoryId}/edit`)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                  </DropdownMenuItem>
                )}
                {hasDeleteAccess && (
                  <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Overview Card */}
      <div className="relative overflow-hidden rounded-[1.5rem] border bg-card shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
        <div className="absolute top-0 right-0 z-10">
          <LastAudit
            lastAudit={inventory.lastAuditLog}
            className="rounded-none rounded-b-2xl border-none shadow-none bg-muted/30 backdrop-blur-md px-4 py-1"
          />
        </div>

        <CardContent className="p-6 pl-10">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">
                {t("inventory.card.sku")}
              </span>
              <div className="flex items-center gap-2 mt-1 flex-wrap pr-16 sm:pr-32">
                <span className="text-2xl font-black">
                  #{inventory.sku || t("inventory.card.noSku")}
                </span>
                <Badge
                  className={cn(
                    "rounded-lg px-2 py-0.5 text-[10px] font-extrabold border",
                    outOfStock
                      ? "bg-destructive/10 text-destructive border-destructive"
                      : lowStock
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500"
                        : "bg-primary/10 text-primary border-primary",
                  )}
                  variant="outline"
                >
                  {outOfStock
                    ? t("inventory.card.outOfStock").toUpperCase()
                    : lowStock
                      ? t("inventory.card.lowStock").toUpperCase()
                      : t("inventory.card.inStock").toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                <Package className="h-8 w-8" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-muted-foreground">
                  {t("inventory.card.name")}
                </span>
                <h1 className="text-[18px] font-bold tracking-tight leading-tight">
                  {inventory.name}
                </h1>
                {inventory.brand && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {t("inventory.card.brand")} :- {inventory.brand}
                  </span>
                )}
                {!inventory.brand && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {t("inventory.detail.unit")} :- {inventory.unit || "Units"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          {/* Financial Overview Title */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-xs font-bold uppercase tracking-[1.2px] text-muted-foreground">
              {t("common.trade.financialOverview")}
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Financial Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialInsightCard
              label={t("inventory.detail.boughtPrice")}
              value={inventory.boughtPrice}
              icon={<TrendingDown className="h-4 w-4" />}
              color="text-muted-foreground"
              t={t}
            />
            <FinancialInsightCard
              label={t("inventory.detail.sellingPrice")}
              value={inventory.sellingPrice}
              icon={<TrendingUp className="h-4 w-4" />}
              color="text-primary"
              t={t}
            />
            <FinancialInsightCard
              label={t("inventory.detail.valuation")}
              value={valuation}
              icon={<DollarSign className="h-4 w-4" />}
              color="text-green-600"
              isPrimary
              t={t}
            />
            <div className="bg-card rounded-3xl p-4 shadow-sm flex flex-col gap-2 border-none">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase">
                <History className="h-4 w-4" />
                {t("inventory.detail.profitMargin")}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-2xl font-black",
                    profitMargin > 15
                      ? "text-green-600"
                      : profitMargin > 0
                        ? "text-yellow-600"
                        : "text-destructive",
                  )}
                >
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Distribution */}
        <WarehouseDistributionAccordion
          inventory={inventory}
          t={t}
          totalQuantity={totalQuantity}
        />

        {/* Deep Inventory Analysis Card */}
        <Card className="rounded-3xl border-none shadow-lg bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ChartColumnIncreasing className="h-32 w-32" />
          </div>
          <CardContent className="pt-8 pb-8 relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl md:text-2xl font-black">
                {t("inventory.detail.analysis.buttonTitle", { name: "" })}
              </h3>
              <p className="text-xs md:text-sm opacity-80 font-medium">
                {t("inventory.detail.analysis.buttonDescription")}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/inventory/${inventoryId}/analysis`)}
              className="bg-white text-primary hover:bg-white/90 rounded-2xl h-10 px-4 md:h-12 md:px-8 font-bold shadow-lg shadow-black/10 text-xs md:text-sm w-full md:w-auto mt-2 md:mt-0"
            >
              <ChartColumnIncreasing className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              {t("inventory.detail.analysis.tabs.analytics")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                entity: t("inventory.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.message", {
                entity: t("inventory.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={() =>
                deleteInventory.mutate(
                  { id: inventoryId },
                  {
                    onSuccess: () => router.push("/inventory"),
                  },
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

function FinancialInsightCard({
  label,
  value,
  icon,
  color,
  isPrimary,
  t,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  color: string;
  isPrimary?: boolean;
  t: any;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-4 shadow-sm flex flex-col gap-2 border-none transition-transform hover:scale-[1.02]",
        isPrimary ? "bg-primary/5" : "bg-card",
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase">
        {icon}
        {label}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-lg sm:text-2xl font-black break-words flex-wrap",
            color,
          )}
        >
          {formatCurrency(value)}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-70">
          {t("inventory.card.currentStock")}
        </span>
      </div>
    </div>
  );
}

function WarehouseDistributionAccordion({
  inventory,
  t,
  totalQuantity,
}: {
  inventory: any;
  t: any;
  totalQuantity: number;
}) {
  const [isOpen, setIsOpen] = React.useState(true);
  const items = inventory.warehouseInventories || [];
  const warehouseCount = items.length;

  const hasAnyLowStock = items.some(
    (item: any) =>
      Number(item.quantity || 0) <= Number(item.reorderQuantity || 0) &&
      Number(item.quantity || 0) > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs font-extrabold uppercase tracking-[1.2px] text-muted-foreground">
          {t("inventory.tab.warehouse")}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="rounded-[1.5rem] border bg-card overflow-hidden shadow-sm"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full px-5 sm:px-10 md:px-16 flex items-center justify-between p-4 h-auto hover:bg-muted/50 transition-colors rounded-none"
          >
            <div className="flex items-center flex-1">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mr-4 shrink-0">
                <Warehouse className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start text-left">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-foreground">
                    {t("common.trade.total")}
                  </span>
                  <span className="text-2xl font-black px-1">
                    {totalQuantity.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {inventory.unit || ""}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {t("common.trade.inventorySummary", {
                    itemCount: totalQuantity,
                    warehouseCount,
                    itemUnit: inventory.unit || "",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              {hasAnyLowStock && (
                <div className="h-7 w-7 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                  <AlertTriangle className="h-[18px] w-[18px] text-destructive" />
                </div>
              )}
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="h-px w-full bg-border" />
          {items.length ? (
            <div className="flex flex-col">
              {items.map((item: any, index: number) => {
                const quantity = Number(item.quantity ?? 0);
                const reorderQuantity = Number(item.reorderQuantity ?? 0);
                const isLowStock = quantity <= reorderQuantity && quantity > 0;
                const sharePercentage =
                  totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;

                const stockColorClass = isLowStock
                  ? "text-destructive"
                  : sharePercentage >= 30
                    ? "text-primary"
                    : "text-foreground";

                const stockBgClass = isLowStock
                  ? "bg-destructive"
                  : sharePercentage >= 30
                    ? "bg-primary"
                    : "bg-foreground/60";

                return (
                  <div
                    key={item.id || `${item.warehouseId}-${index}`}
                    className="flex flex-col gap-4 border-b last:border-b-0 p-5 px-5 sm:px-10 md:px-16 transition-all hover:bg-muted/10 group bg-gradient-to-br from-card to-muted/5"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-extrabold tracking-tight">
                          {item.warehouse?.name ||
                            t("inventory.form.wareInv.ware")}
                        </span>
                        {item.warehouse?.isInternal && (
                          <Badge
                            variant="secondary"
                            className="h-6 px-2 text-[10px] bg-primary/10 text-primary border-none rounded-md flex items-center gap-1 font-bold"
                          >
                            <Warehouse className="h-3 w-3" />
                            {t("warehouse.card.isInternal").toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      {isLowStock && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-destructive/10 text-destructive animate-pulse border border-destructive/20">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="text-[9px] font-black uppercase">
                            {t("inventory.card.lowStock")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Main Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          {t("inventory.card.quantity")}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black tracking-tighter">
                            {quantity.toLocaleString()}
                          </span>
                          <span className="text-sm font-bold text-muted-foreground">
                            {inventory.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end flex-1 max-w-[150px]">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {t("common.share")}
                          </span>
                          <span
                            className={cn(
                              "text-lg font-black",
                              stockColorClass,
                            )}
                          >
                            {sharePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000",
                              stockBgClass,
                            )}
                            style={{
                              width: `${Math.min(sharePercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-border/40">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-medium truncate max-w-[150px]">
                          {item.warehouse?.location || "No Location"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 opacity-50" />
                        <span className="text-[11px] font-medium">
                          {t("inventory.card.reorder")}:{" "}
                          <span className="font-bold text-foreground">
                            {reorderQuantity.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Boxes className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm font-medium">
                {t("inventory.tab.emptyWare")}
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
