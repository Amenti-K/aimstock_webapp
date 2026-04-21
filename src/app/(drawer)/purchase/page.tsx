"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useDeletePurchase,
  useInfinitePurchases,
  useFetchDailyPurchaseReport,
} from "@/api/purchase/api.purchase";
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
import {
  Calendar,
  User,
  Package,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InfiniteScrollTrigger } from "@/components/common/InfiniteScrollTrigger";

export default function PurchasePage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("PURCHASE");
  const hasCreateAccess = canCreate("PURCHASE");

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
  } = useInfinitePurchases(hasViewAccess);

  const {
    data: dailyReportData,
    isLoading: isLoadingDailyReport,
    refetch: refetchDailyReport,
  } = useFetchDailyPurchaseReport(date, hasViewAccess);

  const purchases = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  useEffect(() => {
    if (hasViewAccess) {
      refetchDailyReport();
    }
  }, [date, hasViewAccess, refetchDailyReport]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Purchase" />;
  }

  if (isLoading && purchases.length === 0) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="flex flex-col gap-6 pb-20 sm:pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Purchases
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage your supply chain transactions.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl sm:w-auto"
            onClick={() => router.push("/app/purchase/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> New Purchase
          </Button>
        )}
      </div>

      {/* Daily Summary Section */}
      <DailyReport
        dailyReport={dailyReportData}
        date={date}
        setDate={handleDateChange}
        isLoading={isLoadingDailyReport}
        title="Purchase Summary"
        subtitle="Insights for your inventory intake"
      />

      {/* List Section */}
      <div className="space-y-4 px-1">
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed text-primary">
            <div className="p-4 rounded-full bg-muted mb-4 text-muted-foreground">
              <Plus className="h-8 w-8 opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              No purchases found
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
              Start adding purchases to keep track of your incoming inventory.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Supplier & ID</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Product Details
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase: any) => {
                  const itemCount = purchase.purchaseItems?.length || 0;
                  const mainItem =
                    purchase.purchaseItems?.[0]?.inventory?.name ||
                    "General Items";
                  const poId = `PO-${purchase.id.slice(-6).toUpperCase()}`;

                  return (
                    <TableRow
                      key={purchase.id}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() =>
                        router.push(`/app/purchase/${purchase.id}`)
                      }
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-foreground truncate max-w-[180px]">
                              {purchase.partner?.name || "General Supplier"}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {poId}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">
                            {mainItem}
                          </span>
                          {itemCount > 1 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 h-5 border-primary/20 bg-primary/5"
                            >
                              +{itemCount - 1} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(purchase.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 font-bold text-foreground">
                        {formatCurrency(purchase.total || 0)}
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
