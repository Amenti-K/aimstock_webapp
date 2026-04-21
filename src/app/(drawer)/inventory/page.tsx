"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useDeleteInventory,
  useGetInventoriesInfinite,
} from "@/api/inventory/api.inventory";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreHorizontal,
  Package,
  Eye,
  Pencil,
  Trash2,
  Boxes,
  Tag,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
import { useRouter } from "next/navigation";
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
import {
  IInventory,
  StockStatus,
} from "@/components/interface/inventory/inventory.interface";
import { formatCurrency } from "@/lib/formatter";
import { cn } from "@/lib/utils";

export default function InventoryPage() {
  const router = useRouter();
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const hasCreateAccess = canCreate("INVENTORY");
  const hasUpdateAccess = canUpdate("INVENTORY");
  const hasDeleteAccess = canDelete("INVENTORY");
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>(StockStatus.ALL);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );
  const deleteInventory = useDeleteInventory();

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchText.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchText]);

  const filters = useMemo(
    () => ({
      ...(searchQuery ? { search: searchQuery } : {}),
      stockStatus,
    }),
    [searchQuery, stockStatus],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetInventoriesInfinite(filters, hasViewAccess);

  const items = useMemo(() => {
    return data?.pages?.flatMap((page) => (page as any).data) ?? [];
  }, [data]);

  const handleDelete = () => {
    if (!selectedInventoryId) return;
    deleteInventory.mutate(
      { id: selectedInventoryId },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedInventoryId(null);
        },
      },
    );
  };

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Inventory" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and manage your stock across all warehouses.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
            onClick={() => router.push("/inventory/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inventory..."
            className="pl-8 bg-card border-none shadow-sm focus-visible:ring-1"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All Items", value: StockStatus.ALL },
            { label: "Low Stock", value: StockStatus.LOW },
            { label: "Out of Stock", value: StockStatus.OUT },
          ].map((tab) => (
            <Button
              key={tab.value}
              type="button"
              variant={stockStatus === tab.value ? "default" : "outline"}
              onClick={() => setStockStatus(tab.value)}
              className={cn(
                "rounded-full px-4 h-9",
                stockStatus === tab.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border-none shadow-sm hover:bg-muted",
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              No inventory items found.
            </p>
          </div>
        ) : (
          items.map((item: IInventory) => (
            <InventoryMobileCard
              key={item.id}
              item={item}
              onClick={() => router.push(`/inventory/${item.id}`)}
              hasUpdateAccess={hasUpdateAccess}
              hasDeleteAccess={hasDeleteAccess}
              onDelete={(id) => {
                setSelectedInventoryId(id);
                setIsDeleteOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">Item</TableHead>
              <TableHead className="font-semibold">SKU</TableHead>
              <TableHead className="font-semibold text-right">
                Stock Level
              </TableHead>
              <TableHead className="font-semibold text-right">
                Cost Price
              </TableHead>
              <TableHead className="font-semibold text-right">
                Selling Price
              </TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No inventory items found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item: IInventory) => {
                const totalQuant = item.warehouseInventories.reduce(
                  (acc, warehouseInventory) =>
                    acc + Number(warehouseInventory.quantity),
                  0,
                );
                const totalReorderQuant = item.warehouseInventories.reduce(
                  (acc, warehouseInventory) =>
                    acc + Number(warehouseInventory.reorderQuantity),
                  0,
                );
                const lowStock = totalQuant <= totalReorderQuant;
                const outOfStock = totalQuant <= 0;

                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors group"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">
                            {item.name}
                          </span>
                          {item.brand && (
                            <span className="text-xs text-muted-foreground">
                              {item.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {item.sku || "NO-SKU"}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-bold",
                            outOfStock
                              ? "text-destructive"
                              : lowStock
                                ? "text-yellow-600"
                                : "text-foreground",
                          )}
                        >
                          {totalQuant.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {item.unit || "Units"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.boughtPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className="text-primary">
                        {formatCurrency(item.sellingPrice)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {outOfStock ? (
                        <Badge
                          variant="destructive"
                          className="rounded-full px-3 text-[10px] font-bold"
                        >
                          OUT OF STOCK
                        </Badge>
                      ) : lowStock ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 border-none rounded-full px-3 text-[10px] font-bold"
                        >
                          LOW STOCK
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 border-none rounded-full px-3 text-[10px] font-bold"
                        >
                          IN STOCK
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-primary font-medium hover:bg-primary/5 rounded-full"
          >
            {isFetchingNextPage ? "Loading more..." : "Show more items"}
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inventory?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected inventory item will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InventoryMobileCard({
  item,
  onClick,
  hasUpdateAccess,
  hasDeleteAccess,
  onDelete,
}: {
  item: IInventory;
  onClick: () => void;
  hasUpdateAccess: boolean;
  hasDeleteAccess: boolean;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const totalQuant = item.warehouseInventories.reduce(
    (acc, warehouseInventory) => acc + Number(warehouseInventory.quantity),
    0,
  );
  const totalReorderQuant = item.warehouseInventories.reduce(
    (acc, warehouseInventory) =>
      acc + Number(warehouseInventory.reorderQuantity),
    0,
  );
  const lowStock = totalQuant <= totalReorderQuant;
  const outOfStock = totalQuant <= 0;

  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Package className="h-8 w-8" />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg truncate leading-none">
              {item.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground border">
              {item.sku || "NO-SKU"}
            </code>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground font-medium">
              {item.brand || "Generics"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-1 border border-muted/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Bought
            </span>
          </div>
          <span className="text-sm font-bold">
            {formatCurrency(item.boughtPrice)}
          </span>
        </div>
        <div className="bg-primary/5 rounded-xl p-3 flex flex-col gap-1 border border-primary/10">
          <div className="flex items-center gap-1.5 text-primary/70">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Selling
            </span>
          </div>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(item.sellingPrice)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-dashed">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xl font-black",
                outOfStock
                  ? "text-destructive"
                  : lowStock
                    ? "text-yellow-600"
                    : "text-foreground",
              )}
            >
              {totalQuant.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-muted-foreground uppercase opacity-70">
              {item.unit || "Units"}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">
            Current Stock
          </span>
        </div>

        {outOfStock ? (
          <Badge
            variant="destructive"
            className="rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-destructive/20"
          >
            OUT OF STOCK
          </Badge>
        ) : lowStock ? (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 border-none rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-yellow-200"
          >
            LOW STOCK
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 border-none rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-green-200"
          >
            IN STOCK
          </Badge>
        )}
      </div>
    </div>
  );
}
