"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import i18n from "@/i18n";
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

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useReport(true, filters);

  const reportData = response?.data;
  const reportList = reportData?.reportList || [];

  // If dates are selected, automatically switch to CUSTOM
  useEffect(() => {
    if ((startDate || endDate) && timeFrame !== "CUSTOM") {
      setValue("timeFrame", "CUSTOM");
    }
  }, [startDate, endDate, timeFrame, setValue]);

  // Extract PDF generation logic to keep component clean and reusable
  const generatePDF = () => {
    setIsGenerating(true);

    // Use a small timeout to allow UI to show loading state before heavy JS processing
    setTimeout(() => {
      try {
        // Always use English inside the PDF — jsPDF's built-in fonts don't support
        // Amharic (Ethiopic) characters so we pin translation to "en" here only,
        // without touching the app's current language setting.
        const pt = i18n.getFixedT("en");

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;

        // 1. Report Title & Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        const title = pt("analytics.reports.title", "Financial Report");
        doc.text(title, 14, 22);

        // 2. Period and Generation Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        // Build English period labels directly so they are always ASCII-safe
        const englishTimeFrameLabels: Record<string, string> = {
          LAST_30_DAYS: "Last 30 Days",
          LAST_90_DAYS: "Last 3 Months",
          LAST_180_DAYS: "Last 6 Months",
          LAST_365_DAYS: "Last 1 Year",
          CUSTOM: "Custom",
        };
        const periodText =
          startDate && endDate
            ? `${format(new Date(startDate), "PPP")} - ${format(new Date(endDate), "PPP")}`
            : englishTimeFrameLabels[timeFrame] || timeFrame;

        doc.text(
          `${pt("analytics.reports.period", "Period")}: ${periodText}`,
          14,
          32,
        );
        doc.text(
          `${pt("analytics.reports.generatedOn", "Generated on")}: ${format(new Date(), "PPP")}`,
          pageWidth - 14,
          32,
          { align: "right" },
        );

        // Add a horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 36, pageWidth - 14, 36);

        // 3. Quick Stats summary table
        autoTable(doc, {
          startY: 42,
          theme: "plain",
          styles: {
            fontSize: 10,
            cellPadding: 4,
            halign: "center",
          },
          body: [
            [
              `${pt("analytics.reports.totalIncome", "Total Income")}\n${formatCurrency(reportData?.totalIncome || 0)}`,
              `${pt("analytics.reports.cogs", "Cost of Goods Sold (COGS)")}\n${formatCurrency(reportData?.totalCOGS || 0)}`,
              `${pt("analytics.reports.totalExpenses", "Total Expenses")}\n${formatCurrency(reportData?.totalExpenses || 0)}`,
              `${pt("analytics.reports.grossProfit", "Gross Profit")}\n${formatCurrency(reportData?.grossProfit || 0)}`,
            ],
          ],
          didParseCell: (data) => {
            // Apply bolding to the amount values
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.textColor = [40, 40, 40];
          },
        });

        // 4. Detailed Transactions Table
        const tableColumn = [
          pt("analytics.reports.columns.date", "Date"),
          pt("analytics.reports.columns.type", "Type"),
          pt("analytics.reports.columns.details", "Details"),
          pt("analytics.reports.columns.revenue", "Revenue"),
          pt("analytics.reports.columns.cogsExpense", "COGS / Expense"),
          pt("analytics.reports.columns.profit", "Profit"),
        ];

        const tableRows = reportList.map((item: any) => {
          const isSale = item.type === "SALE";
          const itemDate = new Date(item.createdAt);

          return [
            format(itemDate, "MMM dd, yyyy HH:mm"),
            isSale
              ? pt("analytics.reports.types.sale", "Sale")
              : pt("analytics.reports.types.expense", "Expense"),
            isSale
              ? `${item.totalNumberOfItemsSold} ${pt("analytics.reports.itemsSold", "item(s) sold")}`
              : item.reason || pt("analytics.reports.notAvailable", "N/A"),
            isSale ? formatCurrency(item.totalSaleValue) : "-",
            isSale
              ? formatCurrency(item.totalCOGSValue)
              : formatCurrency(item.amount),
            isSale ? formatCurrency(item.totalProfitValue) : "-",
          ];
        });

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 45;

        autoTable(doc, {
          startY: finalY + 10,
          head: [tableColumn],
          body: tableRows,
          theme: "striped",
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            3: { halign: "right" },
            4: { halign: "right", textColor: [100, 100, 100] },
            5: { halign: "right", fontStyle: "bold" },
          },
          didParseCell: (data) => {
            // Further style positive profit in table body
            if (data.section === "body" && data.column.index === 5) {
              const text = data.cell.text[0] || "";
              if (text !== "-" && !text.includes("-")) {
                data.cell.styles.textColor = [39, 174, 96]; // Emerald shade for positive profit
              }
            }
          },
        });

        // 5. Generate & Save
        const filename = `Financial_Report_${format(new Date(), "yyyy_MM_dd")}.pdf`;
        doc.save(filename);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
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

        <Button
          onClick={generatePDF}
          disabled={isGenerating || reportList.length === 0}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("analytics.reports.downloadPdf", "Download PDF Report")}
        </Button>
      </div>

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
          <CardDescription>
            {t(
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
