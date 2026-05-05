"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatter";
import {
  Box,
  AlertTriangle,
  TrendingUp,
  Clock3,
  DollarSign,
  Activity,
  RefreshCcw,
} from "lucide-react";
import {
  useGetAnalytics,
  usePieChart,
  // useProfit,
} from "@/api/analytics/api.analytics";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import PerformanceChart from "@/components/analytics/PerformanceChart";
// import TrendChart from "@/components/analytics/TrendChart";
import { TimeFrame } from "@/components/interface/inventory/inventory.interface";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();

  const timeFrameOptions = [
    { label: t("common.timeFrame.30days"), value: TimeFrame.LAST_30_DAYS },
    { label: t("common.timeFrame.90days"), value: TimeFrame.LAST_90_DAYS },
    { label: t("common.timeFrame.6months"), value: TimeFrame.LAST_180_DAYS },
    { label: t("common.timeFrame.1year"), value: TimeFrame.LAST_365_DAYS },
  ];
  const { canView } = usePermissions();
  const hasViewAccess = canView("ANALYTICS");
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.LAST_30_DAYS);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useGetAnalytics();

  const {
    data: pieData,
    isLoading: isPieLoading,
    isError: isPieError,
    refetch: refetchPie,
  } = usePieChart(true, { timeFrame });

  // const {
  //   data: profitData,
  //   isLoading: isProfitLoading,
  //   isError: isProfitError,
  //   refetch: refetchProfit,
  // } = useProfit();

  const handleRefresh = () => {
    refetchSummary();
    refetchPie();
    // refetchProfit();
  };

  if (!hasViewAccess) {
    return (
      <AccessDeniedView
        moduleName={t("analytics.moduleName")}
        message={t("analytics.permissions.view")}
      />
    );
  }

  if (isSummaryLoading || isPieLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingView message={t("analytics.pendingAnalytics")} />
      </div>
    );
  }

  if (isSummaryError || isPieError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ErrorView
          message={t("analytics.errorAnalytics")}
          refetch={handleRefresh}
        />
      </div>
    );
  }

  const summary = summaryData?.summary;
  const pie = pieData;
  // const profit = profitData;

  const quickStats = [
    {
      title: t("analytics.summary.bestSelling.title"),
      value: pie?.bestSelling?.inventory || "N/A",
      subtitle: pie?.bestSelling?.quantity
        ? `${pie.bestSelling.quantity} ${t("analytics.summary.bestSelling.sold")}`
        : t("analytics.summary.bestSelling.noData"),
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />,
    },
    {
      title: t("analytics.summary.mostUnsold.title"),
      value: pie?.mostUnsold?.inventory || "N/A",
      subtitle: pie?.mostUnsold?.quantity
        ? `${pie.mostUnsold.quantity} ${t("analytics.summary.mostUnsold.items")}`
        : t("analytics.summary.mostUnsold.inStock"),
      icon: <Clock3 className="h-4 w-4 text-slate-500" />,
    },
    {
      title: t("analytics.chart.metrics.revenue"),
      value: formatCurrency(pie?.totalRevenue || 0),
      icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: t("analytics.chart.metrics.profit"),
      value: formatCurrency(pie?.totalProfit || 0),
      icon: <Activity className="h-4 w-4 text-violet-600" />,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("analytics.dashboardOverview")}
        </h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <Card className="bg-gradient-to-br from-card to-muted/20 border-none shadow-sm overflow-hidden">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <CardDescription className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-primary/70">
              <Box className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t("analytics.summary.totalInv.title")}
            </CardDescription>
            <CardTitle className="text-xl sm:text-3xl font-extrabold tracking-tight mt-1 truncate">
              {formatCurrency(summary?.totalInventoryValue || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight line-clamp-1 sm:line-clamp-none">
              {t("analytics.summary.totalInv.description")}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-amber-500/5 border-none shadow-sm overflow-hidden">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <CardDescription className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {t("analytics.summary.lowStock.title")}
            </CardDescription>
            <CardTitle className="text-xl sm:text-3xl font-extrabold tracking-tight mt-1 truncate">
              {summary?.lowestStock?.inventory ||
                t("analytics.summary.lowStock.optimal")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4 pt-0">
            <p className="text-[10px] sm:text-xs text-amber-600/80 dark:text-amber-400/80 leading-tight line-clamp-1 sm:line-clamp-none font-medium">
              {summary?.lowestStock
                ? `${summary.lowestStock.quantity} ${t("analytics.summary.lowStock.left")}`
                : t("analytics.summary.lowStock.healthy")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between sm:justify-start gap-1 p-1 bg-muted/30 rounded-xl w-full sm:w-fit border border-muted/50 overflow-x-auto no-scrollbar">
          {timeFrameOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={timeFrame === option.value ? "default" : "ghost"}
              onClick={() => setTimeFrame(option.value as TimeFrame)}
              className={cn(
                "h-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-4 rounded-lg flex-1 sm:flex-initial transition-all whitespace-nowrap",
                timeFrame === option.value
                  ? "shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {quickStats.map((card) => (
            <Card
              key={card.title}
              className="bg-secondary/50 border-none transition-all hover:bg-secondary hover:shadow-md group"
            >
              <CardHeader className="p-3 sm:p-5 pb-1.5 sm:pb-2">
                <CardDescription className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                  {card.icon}
                  {card.title}
                </CardDescription>
                <CardTitle className="text-lg sm:text-xl font-bold truncate mt-0.5">
                  {card.value}
                </CardTitle>
              </CardHeader>
              {card.subtitle && (
                <CardContent className="px-3 sm:px-5 pb-3 sm:pb-4 pt-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium truncate">
                    {card.subtitle}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-none bg-card/50">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">
              {t("analytics.chart.performance.title")}
            </CardTitle>
            <CardDescription>
              {t("analytics.chart.performance.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            <PerformanceChart data={pie} />
          </CardContent>
        </Card>

        {/* <Card className="overflow-hidden border-none bg-card/50">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">
                  Growth Trend
                </CardTitle>
                <CardDescription>
                  Revenue and profit comparison over time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                <TrendChart data={profit} />
              </CardContent>
            </Card> */}
      </div>
    </section>
  );
}
