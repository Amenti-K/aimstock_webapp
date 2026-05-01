"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetAdjustmentsInfinite } from "@/api/adjustment/api.adjustment";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, PackageSearch, History } from "lucide-react";
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
import { useLanguage } from "@/hooks/language.hook";
import { InfiniteScrollTrigger } from "@/components/common/InfiniteScrollTrigger";

export default function AdjustmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
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
    return <AccessDeniedView moduleName={t("adjustment.moduleName")} />;
  }

  if (isLoading && adjustments.length === 0) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STOCK_IN":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
            {t("adjustment.types.stockIn")}
          </Badge>
        );
      case "STOCK_OUT":
        return (
          <Badge variant="destructive" className="border-none">
            {t("adjustment.types.stockOut")}
          </Badge>
        );
      case "TRANSFER":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-none">
            {t("adjustment.types.transfer")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20 sm:pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("adjustment.moduleName")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adjustment.card.actions.generalDesc")}
          </p>
        </div>

        {hasCreateAccess && (
          <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
            onClick={() => router.push("/adjustment/new")}
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <PackageSearch className="h-24 w-24 -rotate-12" />
            </div>
            
            <div className="flex gap-4 items-center relative z-10">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-lg">
                  {t("adjustment.form.addAdjustment")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {t("adjustment.card.actions.generalDesc")}
                </p>
              </div>
            </div>
            
            <Button className="w-full sm:w-auto rounded-xl relative z-10 px-6 shadow-lg shadow-primary/20">
              {t("adjustment.card.actions.start")}
            </Button>
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="space-y-4 px-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <History className="h-4 w-4" />
          <h2 className="text-sm font-medium uppercase tracking-wider">
            {t("adjustment.card.recentAdjust")}
          </h2>
        </div>

        {adjustments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed">
            <div className="p-4 rounded-full bg-muted mb-4">
              <PackageSearch className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <p className="text-muted-foreground">{t("adjustment.emptyAdjustment")}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("adjustment.card.item")}</TableHead>
                    <TableHead>{t("adjustment.detail.type")}</TableHead>
                    <TableHead className="text-right">{t("adjustment.detail.qty")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustments.map((adj: any) => (
                    <TableRow
                      key={adj.id}
                      className="group cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => router.push(`/adjustment/${adj.id}`)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(adj.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">
                            {adj.warehouse?.name || adj.inventory?.name || "Unknown"}
                          </span>
                          {adj.itemsCount > 1 && (
                            <span className="text-xs text-muted-foreground">
                              + {adj.itemsCount - 1} {t("common.others")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(adj.type)}</TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {adj.itemsCount ?? adj.quantity ?? 0}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {adjustments.map((adj: any) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                  onClick={() => router.push(`/adjustment/${adj.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <PackageSearch className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-bold text-foreground truncate">
                        {adj.warehouse?.name || adj.inventory?.name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(adj.createdAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {getTypeBadge(adj.type)}
                    <span className="text-sm font-black tabular-nums">
                      {adj.itemsCount ?? adj.quantity ?? 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
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
