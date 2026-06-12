"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleGeneratePDF, handleGenerateExcel } from "@/lib/exportUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatter";
import {
  DollarSign,
  Activity,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Download,
  Loader2,
  Share,
  FileText,
  Grid,
  ChevronRight,
} from "lucide-react";
import { useReport } from "@/api/analytics/api.analytics";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { TimeFrame } from "@/components/interface/inventory/inventory.interface";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Form } from "@/components/ui/form";
import DateField from "@/components/forms/fields/DateField";

const formSchema = z.object({
  timeFrame: z.string(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrintReportPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { canView } = usePermissions();
  const hasViewAccess = canView("ANALYTICS");

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState<
    "download" | "share" | null
  >(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeFrame: TimeFrame.LAST_30_DAYS,
      startDate: null,
      endDate: null,
    },
  });

  const { watch, setValue } = form;
  const timeFrame = watch("timeFrame");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  const timeFrameOptions = [
    {
      label: t("common.timeFrame.30days", "Last 30 Days"),
      value: TimeFrame.LAST_30_DAYS,
    },
    {
      label: t("common.timeFrame.90days", "Last 3 Months"),
      value: TimeFrame.LAST_90_DAYS,
    },
    {
      label: t("common.timeFrame.6months", "Last 6 Months"),
      value: TimeFrame.LAST_180_DAYS,
    },
    {
      label: t("common.timeFrame.1year", "Last 1 Year"),
      value: TimeFrame.LAST_365_DAYS,
    },
    { label: t("analytics.reports.custom", "Custom"), value: "CUSTOM" },
  ];

  const filters = {
    timeFrame: timeFrame === "CUSTOM" ? undefined : timeFrame,
    ...(startDate && { startDate: startDate }),
    ...(endDate && { endDate: endDate }),
  };

  const isCustomIncomplete = timeFrame === "CUSTOM" && (!startDate || !endDate);
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReport(!isCustomIncomplete, filters);

  const reportData = response?.data;
  const reportList = reportData?.reportList || [];

  // If dates are selected, automatically switch to CUSTOM
  useEffect(() => {
    if ((startDate || endDate) && timeFrame !== "CUSTOM") {
      setValue("timeFrame", "CUSTOM");
    }
  }, [startDate, endDate, timeFrame, setValue]);

  const executeExportPDF = async (mode: "download" | "share") => {
    setExportMenuVisible(null);
    setIsGenerating(true);
    let periodText = timeFrame;
    if (timeFrame === "CUSTOM" && startDate && endDate) {
      periodText = `${format(new Date(startDate), "PPP")} - ${format(new Date(endDate), "PPP")}`;
    } else {
      const labels: Record<string, string> = {
        LAST_30_DAYS: "Last 30 Days",
        LAST_90_DAYS: "Last 3 Months",
        LAST_180_DAYS: "Last 6 Months",
        LAST_365_DAYS: "Last 1 Year",
        CUSTOM: "Custom",
      };
      periodText = labels[timeFrame] || timeFrame;
    }
    await handleGeneratePDF(reportData, reportList, periodText, mode);
    setIsGenerating(false);
  };

  const executeExportExcel = async (mode: "download" | "share") => {
    setExportMenuVisible(null);
    setIsGenerating(true);
    await handleGenerateExcel(reportData, reportList, mode);
    setIsGenerating(false);
  };

  if (!hasViewAccess) {
    return (
      <AccessDeniedView
        moduleName={t("analytics.reports.title", "Financial Report")}
        message={t(
          "analytics.permissions.view",
          "You do not have permission to view Analytics data.",
        )}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingView
          message={t("analytics.pendingAnalytics", "Loading analytics data...")}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ErrorView
          message={t(
            "analytics.errorAnalytics",
            "Failed to load analytics data.",
          )}
          refetch={refetch}
        />
      </div>
    );
  }

  const quickStats = [
    {
      title: t("analytics.reports.totalIncome", "Total Income"),
      value: formatCurrency(reportData?.totalIncome || 0),
      icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: t("analytics.reports.cogs", "Cost of Goods Sold (COGS)"),
      value: formatCurrency(reportData?.totalCOGS || 0),
      icon: <ShoppingBag className="h-4 w-4 text-amber-600" />,
    },
    {
      title: t("analytics.reports.totalExpenses", "Total Expenses"),
      value: formatCurrency(reportData?.totalExpenses || 0),
      icon: <CreditCard className="h-4 w-4 text-rose-600" />,
    },
    {
      title: t("analytics.reports.grossProfit", "Gross Profit"),
      value: formatCurrency(reportData?.grossProfit || 0),
      icon: <Activity className="h-4 w-4 text-violet-600" />,
    },
  ];

  return (
    <section className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("analytics.reports.title", "Financial Report")}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setExportMenuVisible("download")}
            disabled={isGenerating || reportList.length === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {t("analytics.reports.download", "Download")}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setExportMenuVisible("share")}
            disabled={isGenerating || reportList.length === 0}
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            {t("analytics.reports.share", "Share")}
          </Button>
        </div>
      </div>

      <Dialog
        open={exportMenuVisible !== null}
        onOpenChange={(isOpen) => !isOpen && setExportMenuVisible(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {exportMenuVisible === "download"
                ? t("analytics.reports.download", "Download")
                : t("analytics.reports.share", "Share")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <button
              onClick={() => executeExportPDF(exportMenuVisible!)}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950">
                <FileText className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">PDF</p>
                <p className="text-sm text-muted-foreground">
                  {exportMenuVisible === "download"
                    ? t("analytics.reports.downloadPdf", "Download as PDF")
                    : t("analytics.reports.sharePdf", "Share as PDF")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => executeExportExcel(exportMenuVisible!)}
              className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
                <Grid className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Excel</p>
                <p className="text-sm text-muted-foreground">
                  {exportMenuVisible === "download"
                    ? t("analytics.reports.downloadExcel", "Download as Excel")
                    : t("analytics.reports.shareExcel", "Share as Excel")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Form {...form}>
        <form className="flex flex-col md:flex-row gap-4 p-4 bg-muted/20 rounded-md border items-start md:items-center">
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("analytics.reports.quickSelect", "Quick Select")}
            </span>
            <div className="flex flex-nowrap overflow-x-auto items-center gap-1 p-1 bg-muted/30 rounded-xl border border-muted/50 no-scrollbar">
              {timeFrameOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={timeFrame === option.value ? "default" : "ghost"}
                  onClick={() => {
                    setValue("timeFrame", option.value);
                    if (option.value !== "CUSTOM") {
                      setValue("startDate", null);
                      setValue("endDate", null);
                    }
                  }}
                  className={cn(
                    "h-8 text-[11px] font-bold uppercase tracking-wider px-3 rounded-lg transition-all whitespace-nowrap",
                    timeFrame === option.value
                      ? "shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full xl:w-auto">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              {t("analytics.reports.customDateRange", "Custom Date Range")}
            </span>
            <div className="flex flex-row items-start sm:items-center gap-2">
              <div className="w-full sm:w-[160px]">
                <DateField
                  name="startDate"
                  control={form.control as any}
                  placeholder={t("analytics.reports.start", "Start Date")}
                />
              </div>
              <span className="text-muted-foreground hidden sm:inline-block">
                {t("common.to", "to")}
              </span>
              <div className="w-full sm:w-[160px]">
                <DateField
                  name="endDate"
                  control={form.control as any}
                  placeholder={t("analytics.reports.end", "End Date")}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Aggregated Stats - Screen View */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {quickStats.map((card) => (
          <Card key={card.title} className="bg-card border shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {card.icon}
                {card.title}
              </CardDescription>
              <CardTitle className="text-2xl font-bold truncate mt-1">
                {card.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Detailed List */}
      <Card className="border">
        <CardHeader className="p-4 py-0 mb-4">
          <CardTitle className="text-lg">
            {t(
              "analytics.reports.detailedTransactions",
              "Detailed Transactions",
            )}
          </CardTitle>
          <CardDescription
            className={cn(isCustomIncomplete && "text-destructive font-medium")}
          >
            {isCustomIncomplete
              ? t(
                  "analytics.reports.nullDate",
                  "Please select both start and end dates for a custom range.",
                )
              : t(
                  "analytics.reports.detailedDescription",
                  "List of all sales and expenses for the selected period, sorted by date.",
                )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("analytics.reports.columns.date", "Date")}
                  </TableHead>
                  <TableHead>
                    {t("analytics.reports.columns.type", "Type")}
                  </TableHead>
                  <TableHead>
                    {t("analytics.reports.columns.details", "Details")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("analytics.reports.columns.revenue", "Revenue")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t(
                      "analytics.reports.columns.cogsExpense",
                      "COGS / Expense",
                    )}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("analytics.reports.columns.profit", "Profit")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportList.length > 0 ? (
                  reportList.map((item: any) => {
                    const isSale = item.type === "SALE";
                    const itemDate = new Date(item.createdAt);

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(itemDate, "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "px-2 py-1 text-xs font-semibold rounded-full",
                              isSale
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800",
                            )}
                          >
                            {isSale
                              ? t("analytics.reports.types.sale", "Sale")
                              : t("analytics.reports.types.expense", "Expense")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isSale ? (
                            <span className="text-xs text-muted-foreground">
                              {item.totalNumberOfItemsSold}{" "}
                              {t("analytics.reports.itemsSold", "item(s) sold")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {item.reason ||
                                t("analytics.reports.notAvailable", "N/A")}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {isSale ? formatCurrency(item.totalSaleValue) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          {isSale
                            ? formatCurrency(item.totalCOGSValue)
                            : formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-bold",
                            isSale && item.totalProfitValue > 0
                              ? "text-emerald-600"
                              : "text-muted-foreground",
                          )}
                        >
                          {isSale ? formatCurrency(item.totalProfitValue) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {t(
                        "analytics.reports.noTransactions",
                        "No transactions found for the selected period.",
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
