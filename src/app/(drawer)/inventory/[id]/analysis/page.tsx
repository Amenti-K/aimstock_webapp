"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  History,
  Warehouse,
  DollarSign,
  Briefcase,
  CalendarClock,
  ArrowUpRight,
  ArrowDownLeft,
  LayoutGrid,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import {
  useFetchInventory,
  useFetchInventoryAnalytics,
} from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { TimeFrame } from "@/components/interface/inventory/inventory.interface";
import { cn } from "@/lib/utils";

export default function InventoryAnalysisPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const inventoryId = id as string;
  const { canView } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.LAST_30_DAYS);

  const { data: inventoryDetail } = useFetchInventory(
    inventoryId,
    hasViewAccess,
  );
  const { data, isLoading, isError, refetch } = useFetchInventoryAnalytics(
    inventoryId,
    hasViewAccess,
    { timeFrame },
  );

  const analyticsData = data?.data;

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !analyticsData) return <ErrorView refetch={refetch} />;

  const inventory = inventoryDetail?.data;
  const analytics = analyticsData;
  const unit = inventory?.unit || "unit";

  const timeOptions = [
    { label: "30D", value: TimeFrame.LAST_30_DAYS },
    { label: "90D", value: TimeFrame.LAST_90_DAYS },
    { label: "6M", value: TimeFrame.LAST_180_DAYS },
    { label: "1Y", value: TimeFrame.LAST_365_DAYS },
  ];

  const warehouseColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
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
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight leading-none">
              {t("inventory.detail.analysis.buttonTitle", { name: "" }).replace(
                "  ",
                " ",
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">
              {inventory?.name || t("inventory.card.name")}
            </p>
          </div>
        </div>

        <div className="flex bg-muted/30 p-1 rounded-2xl border border-muted/50 w-full md:w-auto overflow-x-auto no-scrollbar">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeFrame(option.value)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                timeFrame === option.value
                  ? "bg-card text-primary shadow-sm ring-1 ring-primary/10"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="flex w-full md:w-fit bg-muted/30 p-1.5 rounded-2xl h-auto gap-1 mb-1">
          <TabsTrigger
            value="analytics"
            className="flex-1 md:px-8 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border-none font-bold text-xs"
          >
            {t("inventory.detail.analysis.tabs.analytics")}
          </TabsTrigger>
          <TabsTrigger
            value="movement"
            className="flex-1 md:px-8 py-2.5 rounded-xl data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm border-none font-bold text-xs"
          >
            {t("inventory.detail.analysis.tabs.movement")}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="analytics"
          className="space-y-8 animate-in fade-in duration-500"
        >
          {/* Main Financials */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={t("inventory.detail.analysis.metrics.revenue")}
              value={analytics.financials.totalRevenue}
              icon={<TrendingUp className="h-4 w-4" />}
              color="#10b981"
              isCurrency
            />
            <MetricCard
              title={t("inventory.detail.analysis.metrics.COGS")}
              value={analytics.financials.totalCOGS}
              icon={<Briefcase className="h-4 w-4" />}
              color="#f59e0b"
              isCurrency
            />
            <MetricCard
              title={t("inventory.detail.analysis.metrics.profit")}
              value={analytics.financials.totalProfit}
              icon={<DollarSign className="h-4 w-4" />}
              color="#8b5cf6"
              isCurrency
            />
            <MetricCard
              title={t("inventory.detail.analysis.metrics.totalSale")}
              value={Number(analytics.summary.totalSale || 0).toFixed(2)}
              icon={<ArrowUpRight className="h-4 w-4" />}
              color="#ec4899"
              unit={unit}
            />
          </div>

          {/* Profit Margin Banner */}
          <div className="bg-primary rounded-3xl p-6 md:p-8 flex items-center justify-between text-primary-foreground relative overflow-hidden shadow-lg shadow-primary/20">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">
                Net Profit Margin
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-black">
                  {Number(analytics.financials.profitMargin || 0).toFixed(1)}
                </span>
                <span className="text-2xl font-bold opacity-80">%</span>
              </div>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative z-10 shadow-inner">
              <TrendingUp className="h-8 w-8 md:h-10 md:w-10" />
            </div>
          </div>

          {/* Warehouse Performance */}
          <div className="rounded-[1.5rem] p-0 border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Warehouse className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <CardTitle className="text-xl font-black leading-none">
                    Warehouse Performance
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    Cross-site sales contribution
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-0 space-y-2">
              {/* Joint Progress Bar */}
              <div className="h-2 sm:h-4 mb-4 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                {analytics.analysis.topPerformingWarehouses
                  .slice(0, 5)
                  .map((w, i) => {
                    const percentage =
                      analytics.summary.totalSale > 0
                        ? (w.totalSold / analytics.summary.totalSale) * 100
                        : 0;
                    return (
                      <div
                        key={i}
                        className="h-full transition-all duration-1000"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor:
                            warehouseColors[i % warehouseColors.length],
                        }}
                      />
                    );
                  })}
              </div>

              {/* Warehouse Details */}
              <div className="grid gap-3 sm:grid-cols-2">
                {analytics.analysis.topPerformingWarehouses.length > 0 ? (
                  analytics.analysis.topPerformingWarehouses.map((w, i) => {
                    const percentage =
                      analytics.summary.totalSale > 0
                        ? (w.totalSold / analytics.summary.totalSale) * 100
                        : 0;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-3xl border border-b border-muted/5 transition-all hover:bg-muted/10 group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                            style={{
                              backgroundColor:
                                warehouseColors[i % warehouseColors.length],
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm leading-none">
                              {w.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold mt-1.5 uppercase opacity-70">
                              {w.totalSold} {unit}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black text-primary leading-none">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-[9px] text-muted-foreground font-bold mt-1 uppercase text-right">
                            {formatCurrency(w.revenue)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40">
                    <LayoutGrid className="h-10 w-10 mb-2" />
                    <p className="text-sm font-bold">No Warehouse Data</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-3xl p-5 border shadow-sm group transition-all hover:border-primary/20">
              <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase mb-4 tracking-widest">
                <TrendingDown className="h-4 w-4" />
                {t("inventory.detail.analysis.metrics.avgPurchasePrice")}
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black">
                  {formatCurrency(analytics.financials.avgPurchasePrice)}
                </span>
              </div>
            </div>
            <div className="bg-card rounded-3xl p-5 border shadow-sm group transition-all hover:border-primary/20">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase mb-4 tracking-widest">
                <TrendingUp className="h-4 w-4" />
                {t("inventory.detail.analysis.metrics.avgSalePrice")}
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-2xl font-black text-primary">
                  {formatCurrency(analytics.financials.avgSalePrice)}
                </span>
              </div>
            </div>
            <MetricCard
              title={t("inventory.detail.analysis.metrics.avgDailySales")}
              value={Number(analytics.summary.avgDailySales || 0).toFixed(2)}
              icon={<CalendarClock className="h-4 w-4" />}
              color="#ec4899"
              unit={unit}
            />
          </div>
        </TabsContent>

        <TabsContent
          value="movement"
          className="space-y-6 animate-in slide-in-from-right duration-500"
        >
          {/* Mobile Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6 overflow-x-auto no-scrollbar pb-2">
            <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10 flex flex-col gap-1 ring-1 ring-blue-500/5 min-w-[140px]">
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                <ArrowDownLeft className="h-4 w-4" />
                {t("inventory.detail.analysis.metrics.totalPurchase")}
              </div>
              <span className="text-xl font-black text-blue-600">
                {analytics.summary.totalPurchase.toLocaleString()}{" "}
                <span className="text-[10px] opacity-70 underline decoration-2">
                  {unit}
                </span>
              </span>
            </div>
            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 flex flex-col gap-1 ring-1 ring-emerald-500/5 min-w-[140px]">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-wider">
                <ArrowUpRight className="h-4 w-4" />
                {t("inventory.detail.analysis.metrics.totalSale")}
              </div>
              <span className="text-xl font-black text-emerald-600">
                {analytics.summary.totalSale.toLocaleString()}{" "}
                <span className="text-[10px] opacity-70 underline decoration-2">
                  {unit}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-[1.5rem] border-none shadow-sm bg-card overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="pb-2 text-xl font-black border-b border-border/50 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <History className="h-5 w-5" />
                </div>
                {t("inventory.detail.analysis.tabs.movement")}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-8 pt-0 space-y-3">
              {analytics.history?.length > 0 ? (
                analytics.history.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-3xl border border-transparent transition-all cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner",
                          item.type === "purchase"
                            ? "bg-blue-100/50 text-blue-600"
                            : "bg-red-100/50 text-red-600",
                        )}
                      >
                        {item.type === "purchase" ? (
                          <ArrowDownLeft className="h-6 w-6" />
                        ) : (
                          <ArrowUpRight className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-black text-sm uppercase",
                              item.type === "purchase"
                                ? "text-blue-600"
                                : "text-red-600",
                            )}
                          >
                            {item.type}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium mt-1">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black tracking-tight">
                        {item.type === "purchase" ? "+" : "-"}{" "}
                        {Number(item.quantity).toLocaleString()} {unit}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold mt-0.5">
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <Info className="h-12 w-12 mb-4" />
                  <p className="font-bold">
                    {t("inventory.tab.emptyPurchase")} /{" "}
                    {t("inventory.tab.emptySale")}
                  </p>
                </div>
              )}
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  color,
  isCurrency = false,
  unit,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  color: string;
  isCurrency?: boolean;
  unit?: string;
}) {
  return (
    <div className="bg-card rounded-3xl p-5 border shadow-sm flex flex-col gap-4 group transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div
        className="h-10 w-10 flex items-center justify-center rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2 opacity-70">
          {title}
        </p>
        <div className="flex items-baseline gap-1 overflow-hidden">
          <span className="text-lg sm:text-2xl font-black truncate">
            {isCurrency
              ? formatCurrency(value)
              : Number(value).toLocaleString()}
          </span>
          {!isCurrency && unit && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 truncate">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
