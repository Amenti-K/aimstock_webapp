"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useDeleteSale,
  useInfiniteSales,
  useFetchDailySaleReport,
} from "@/api/sale/api.sale";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { DailyReport } from "@/components/common/DailyReport";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Calendar, User, Package, ChevronRight, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfiniteScrollTrigger } from "@/components/common/InfiniteScrollTrigger";

export default function SalesPage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("SALES");
  const hasCreateAccess = canCreate("SALES");

  const [date, setDate] = useState<Date>(new Date());

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteSales(hasViewAccess);

  const {
    data: dailyReportData,
    isLoading: isLoadingDailyReport,
    refetch: refetchDailyReport,
  } = useFetchDailySaleReport(date, hasViewAccess);

  const sales = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  useEffect(() => {
    if (hasViewAccess) {
      refetchDailyReport();
    }
  }, [date, hasViewAccess, refetchDailyReport]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Sales" />;
  }

  if (isLoading && sales.length === 0) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="flex flex-col gap-6 pb-20 sm:pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sales
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your outgoing stocks and revenue.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all hover:shadow-xl sm:w-auto"
            onClick={() => router.push("/app/sales/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> New Sale
          </Button>
        )}
      </div>

      {/* Daily Summary Section */}
      <DailyReport
        dailyReport={dailyReportData}
        date={date}
        setDate={handleDateChange}
        isLoading={isLoadingDailyReport}
        title="Sales Summary"
        subtitle="Insights for your daily revenue"
      />

      {/* List Section */}
      <div className="space-y-4 px-1">
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed text-emerald-600">
            <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground">
              <Plus className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              No sales found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Start recording sales to track your business performance.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden text-emerald-600">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Customer & ID</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Product Details
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale: any) => {
                  const itemCount = sale.saleItems?.length || 0;
                  const mainItem =
                    sale.saleItems?.[0]?.inventory?.name || "General Items";
                  const soId = `SO-${sale.id.slice(-6).toUpperCase()}`;

                  return (
                    <TableRow
                      key={sale.id}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => router.push(`/app/sales/${sale.id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Receipt className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[180px]">
                              {sale.partner?.name || "Walk-in Customer"}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {soId}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px] text-muted-foreground">
                            {mainItem}
                          </span>
                          {itemCount > 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 h-5 border-emerald-200 bg-emerald-50 text-emerald-700"
                            >
                              +{itemCount - 1} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-4 text-muted-foreground">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(sale.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 font-bold text-emerald-600">
                        {formatCurrency(sale.total || 0)}
                      </TableCell>
                      <TableCell className="py-4">
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <InfiniteScrollTrigger
          hasNextPage={!!hasNextPage}
          isLoading={isFetchingNextPage}
          onIntersect={fetchNextPage}
        />
      </div>
    </div>
  );
}
