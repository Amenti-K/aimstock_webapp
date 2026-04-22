"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetAdjustmentsInfinite } from "@/api/adjustment/api.adjustment";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, PackageSearch } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatter";

export default function AdjustmentPage() {
  const router = useRouter();
  const { canView, canCreate } = usePermissions();
  const hasViewAccess = canView("INVENTORYADJUSTMENT");
  const hasCreateAccess = canCreate("INVENTORYADJUSTMENT");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAdjustmentsInfinite({}, hasViewAccess);

  const adjustments = React.useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Inventory Adjustment" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stock Adjustments</h1>
          <p className="text-sm text-muted-foreground">
            View history of manual stock level corrections.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push("/adjustment/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> New Adjustment
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item / Warehouse</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No adjustments found.
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((adj: any) => (
                <TableRow
                  key={adj.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/adjustment/${adj.id}`)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(adj.createdAt)}
                  </TableCell>
                  <TableCell>
                    {adj.warehouse?.name || adj.inventory?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={adj.type === "STOCK_IN" ? "secondary" : "destructive"}
                    >
                      {adj.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    {adj.itemsCount ?? adj.quantity ?? 0}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {adj.reason || "Manual Correction"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {adjustments.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No adjustments found.
          </div>
        ) : (
          adjustments.map((adj: any) => (
            <div
              key={adj.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm cursor-pointer active:opacity-70"
              onClick={() => router.push(`/adjustment/${adj.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <PackageSearch className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold leading-tight">
                    {adj.warehouse?.name || adj.inventory?.name || "Unknown"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(adj.createdAt)}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={adj.type === "STOCK_IN" ? "secondary" : "destructive"}
                      className="text-[10px]"
                    >
                      {adj.type}
                    </Badge>
                    <span className="text-xs font-bold">
                      Qty: {adj.itemsCount ?? adj.quantity ?? 0}
                    </span>
                  </div>
                  {adj.reason && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {adj.reason}
                    </span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          ))
        )}
      </div>

      {hasNextPage && (
        <div className="flex justify-center w-full">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
