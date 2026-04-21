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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function InventoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
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
    return <AccessDeniedView moduleName="Inventory" />;
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
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 border-none bg-card shadow-sm hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {inventory.name}
                </h1>
                <code className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground border">
                  #{inventory.sku || "NO-SKU"}
                </code>
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {inventory.brand || "General"} • {inventory.unit || "Units"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {hasUpdateAccess && (
            <Button
              variant="outline"
              className="flex-1 md:flex-none rounded-full shadow-sm border-none bg-card"
              onClick={() => router.push(`/app/inventory/${inventoryId}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {hasDeleteAccess && (
            <Button
              variant="destructive"
              className="flex-1 md:flex-none rounded-full shadow-md"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

         <div className="flex flex-col gap-8">
        {/* Main Info Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  SKU
                </p>
                <p className="font-bold text-lg">{inventory.sku || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Brand
                </p>
                <p className="font-bold text-lg">{inventory.brand || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Unit
                </p>
                <p className="font-bold text-lg">{inventory.unit || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Initial
                </p>
                <p className="font-bold text-lg">
                  {Number(inventory.initialQuantity || 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "rounded-3xl border-none shadow-sm overflow-hidden",
              outOfStock
                ? "bg-destructive/5"
                : lowStock
                  ? "bg-yellow-500/5"
                  : "bg-primary/5",
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-primary">
                    {totalQuantity.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    {inventory.unit} Total
                  </span>
                </div>
                <Badge
                  className={cn(
                    "rounded-full px-4 py-1 text-[10px] font-bold",
                    outOfStock
                      ? "bg-destructive text-destructive-foreground"
                      : lowStock
                        ? "bg-yellow-500 text-white"
                        : "bg-green-500 text-white",
                  )}
                >
                  {outOfStock
                    ? "OUT OF STOCK"
                    : lowStock
                      ? "LOW STOCK"
                      : "IN STOCK"}
                </Badge>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000",
                    outOfStock
                      ? "w-0"
                      : lowStock
                        ? "bg-yellow-500 w-1/4"
                        : "bg-primary w-full",
                  )}
                />
              </div>
              <p className="text-[10px] font-medium text-muted-foreground">
                Reorder starts at {totalReorderQuantity.toLocaleString()}{" "}
                {inventory.unit}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialInsightCard
            label="Bought Price"
            value={inventory.boughtPrice}
            icon={<TrendingDown className="h-4 w-4" />}
            color="text-muted-foreground"
          />
          <FinancialInsightCard
            label="Selling Price"
            value={inventory.sellingPrice}
            icon={<TrendingUp className="h-4 w-4" />}
            color="text-primary"
          />
          <FinancialInsightCard
            label="Inventory Valuation"
            value={valuation}
            icon={<DollarSign className="h-4 w-4" />}
            color="text-green-600"
            isPrimary
          />
          <div className="bg-card rounded-3xl p-4 shadow-sm flex flex-col gap-2 border-none">
            <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase">
              <History className="h-4 w-4" />
              Profit Margin
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
              <span className="text-[10px] text-muted-foreground font-medium italic">
                Net Returns
              </span>
            </div>
          </div>
        </div>

        {/* Warehouse Distribution */}
        <Card className="rounded-3xl border-none shadow-sm bg-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">
                    Warehouse Distribution
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    Current availability across sites
                  </span>
                </div>
              </CardTitle>
              <Badge
                variant="outline"
                className="rounded-full font-bold text-[10px]"
              >
                {inventory.warehouseInventories?.length || 0} SITES
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {inventory.warehouseInventories?.length ? (
              <div className="grid gap-3">
                {inventory.warehouseInventories.map((item, index) => {
                  const quantity = Number(item.quantity || 0);
                  const reorderQuantity = Number(item.reorderQuantity || 0);
                  const isItemLow = quantity <= reorderQuantity;
                  const sharePercentage =
                    totalQuantity > 0 ? (quantity / totalQuantity) * 100 : 0;

                  return (
                    <div
                      key={item.id || `${item.warehouseId}-${index}`}
                      className="flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-xl transition-all",
                              isItemLow
                                ? "bg-destructive/10 text-destructive"
                                : "bg-primary/10 text-primary",
                            )}
                          >
                            <Warehouse className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-base leading-none">
                                {item.warehouse?.name || "Warehouse"}
                              </p>
                              {item.warehouse?.isInternal && (
                                <Badge
                                  variant="secondary"
                                  className="h-5 px-1.5 text-[10px] bg-primary/10 text-primary border-none rounded-md"
                                >
                                  INTERNAL
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5 text-left">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase truncate max-w-[150px]">
                                <LayoutGrid className="h-3 w-3" />
                                {item.warehouse?.location || "No Location"}
                              </div>
                              {isItemLow && (
                                <Badge
                                  variant="destructive"
                                  className="h-4 px-1 text-[8px] font-black rounded-sm"
                                >
                                  LOW STOCK
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p
                            className={cn(
                              "font-black text-2xl tracking-tight leading-none",
                              isItemLow
                                ? "text-destructive"
                                : "text-foreground",
                            )}
                          >
                            {quantity.toLocaleString()}
                          </p>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                            {inventory.unit || "Units"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground">
                            Distribution Share
                          </span>
                          <span
                            className={
                              isItemLow ? "text-destructive" : "text-primary"
                            }
                          >
                            {sharePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.2)]",
                              isItemLow ? "bg-destructive" : "bg-primary",
                            )}
                            style={{ width: `${Math.min(sharePercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-muted-foreground font-medium">
                            Reorder threshold:{" "}
                            <span className="font-bold">
                              {reorderQuantity.toLocaleString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Boxes className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">
                  No warehouse distribution found.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deep Inventory Analysis Card */}
        <Card className="rounded-3xl border-none shadow-lg bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ChartColumnIncreasing className="h-32 w-32" />
          </div>
          <CardContent className="pt-8 pb-8 relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-2xl font-black">Deep Inventory Analysis</h3>
              <p className="text-sm opacity-80 font-medium">
                Unlock detailed movement trends, predictive stock life, and
                historical valuation shifts for {inventory.name}.
              </p>
            </div>
            <Button
              onClick={() =>
                router.push(`/app/inventory/${inventoryId}/analysis`)
              }
              className="bg-white text-primary hover:bg-white/90 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-black/10"
            >
              <ChartColumnIncreasing className="mr-2 h-5 w-5" />
              Launch Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inventory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The inventory and related entries
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={() =>
                deleteInventory.mutate(
                  { id: inventoryId },
                  {
                    onSuccess: () => router.push("/app/inventory"),
                  },
                )
              }
            >
              Delete
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
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  color: string;
  isPrimary?: boolean;
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
        <span className={cn("text-2xl font-black truncate", color)}>
          {formatCurrency(value)}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase opacity-70">
          Current Value
        </span>
      </div>
    </div>
  );
}
