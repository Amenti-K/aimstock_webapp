"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useGetAdjustmentsInfinite } from "@/api/adjustment/api.adjustment";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, Search, MoreHorizontal, Eye, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatter";

export default function AdjustmentPage() {
  const router = useRouter();
  const { canView, canCreate, canUpdate } = usePermissions();
  const hasViewAccess = canView("INVENTORYADJUSTMENT");
  const hasCreateAccess = canCreate("INVENTORYADJUSTMENT");
  const hasUpdateAccess = canUpdate("INVENTORYADJUSTMENT");
  const [search, setSearch] = React.useState("");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAdjustmentsInfinite({ search }, hasViewAccess);

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
          <h1 className="text-2xl font-bold tracking-tight">
            Stock Adjustments
          </h1>
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

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No adjustments found.
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((adj: any) => (
                <TableRow
                  key={adj.id}
                  className="cursor-pointer"
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
                      variant={
                        adj.type === "STOCK_IN" ? "secondary" : "destructive"
                      }
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
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/adjustment/${adj.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View details
                        </DropdownMenuItem>
                        {hasUpdateAccess && (
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/adjustment/${adj.id}/edit`)
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasNextPage && (
          <div className="flex justify-center p-4">
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
    </div>
  );
}
