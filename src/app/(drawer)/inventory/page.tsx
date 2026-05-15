"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useDeleteInventory,
  useGetInventoriesInfinite,
} from "@/api/inventory/api.inventory";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
  Box,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
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
  ExpiryStatus,
} from "@/components/interface/inventory/inventory.interface";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { useFetchCategories } from "@/api/inventory/api.inventory";
import SelectField from "@/components/forms/fields/SelectField";
import MultiSelectField from "@/components/forms/fields/MultiSelectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const filterSchema = z.object({
  search: z.string().optional(),
  stockStatus: z.nativeEnum(StockStatus).optional(),
  expiryStatus: z.nativeEnum(ExpiryStatus).optional(),
  categoryIds: z.array(z.string()).optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

export default function InventoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const hasCreateAccess = canCreate("INVENTORY");
  const hasUpdateAccess = canUpdate("INVENTORY");
  const hasDeleteAccess = canDelete("INVENTORY");
  const [searchText, setSearchText] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(
    null,
  );

  const { control, watch, reset, setValue } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: "",
      stockStatus: StockStatus.ALL,
      expiryStatus: ExpiryStatus.NONE,
      categoryIds: [],
    },
  });

  const {
    stockStatus: selectedStockStatus,
    expiryStatus: selectedExpiryStatus,
    categoryIds: selectedCategoryIds,
  } = watch();

  const { data: categoriesData } = useFetchCategories();
  const deleteInventory = useDeleteInventory();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setValue("search", searchText.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchText, setValue]);

  const searchQuery = watch("search");

  const filters = useMemo(
    () => ({
      ...(searchQuery ? { search: searchQuery } : {}),
      stockStatus: selectedStockStatus,
      expiryStatus:
        selectedExpiryStatus === ExpiryStatus.NONE
          ? undefined
          : selectedExpiryStatus,
      categoryIds: selectedCategoryIds?.length
        ? selectedCategoryIds
        : undefined,
    }),
    [
      searchQuery,
      selectedStockStatus,
      selectedExpiryStatus,
      selectedCategoryIds,
    ],
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
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative">
      <div className="hidden md:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Boxes className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("inventory.moduleName")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("inventory.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 shadow-sm"
            onClick={() => router.push("/inventory/category")}
          >
            <Box className="mr-2 h-4 w-4" /> {t("category.moduleName")}
          </Button>
          {hasCreateAccess && (
            <Button
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
              onClick={() => router.push("/inventory/new")}
            >
              <Plus className="mr-2 h-4 w-4" /> {t("common.addNew")}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 bg-card rounded-2xl border-none shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Search Row/Col */}
          <div className="w-full md:w-72 shrink-0 space-y-1.5 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("inventory.form.searchPlaceholder")}
                className="pl-8 bg-muted/30 border-none shadow-none focus-visible:ring-1 h-10"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            {(selectedExpiryStatus !== ExpiryStatus.NONE ||
              (selectedCategoryIds?.length ?? 0) > 0 ||
              selectedStockStatus !== StockStatus.ALL) && (
              <div className="">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    reset({
                      search: searchQuery,
                      stockStatus: StockStatus.ALL,
                      expiryStatus: ExpiryStatus.NONE,
                      categoryIds: [],
                    });
                  }}
                  className="w-fit p-1 text-destructive hover:bg-destructive/10 rounded-xl border border-destructive/10 bg-destructive/5"
                >
                  {t("common.clearAll")}
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-row items-center gap-3 overflow-x-hidden flex-1 pb-1 lg:pb-0 scrollbar-hide">
            <div className="w-[100px] flex-1">
              <SelectField
                name="stockStatus"
                control={control as any}
                label={t("inventory.tabs.stockStatus")}
                options={[
                  { label: t("inventory.tabs.none"), value: StockStatus.ALL },
                  { label: t("inventory.tabs.low"), value: StockStatus.LOW },
                  { label: t("inventory.tabs.out"), value: StockStatus.OUT },
                ]}
              />
            </div>

            <div className="w-[100px] flex-1">
              <SelectField
                name="expiryStatus"
                control={control as any}
                label={t("inventory.card.expiryStatus")}
                options={[
                  { label: t("inventory.tabs.none"), value: ExpiryStatus.NONE },
                  {
                    label: t("inventory.tabs.expired"),
                    value: ExpiryStatus.EXPIRED,
                  },
                  {
                    label: t("inventory.tabs.in1Month", {
                      defaultValue: "In 1 Month",
                    }),
                    value: ExpiryStatus.IN_1_MONTH,
                  },
                  {
                    label: t("inventory.tabs.in3Month", {
                      defaultValue: "In 3 Months",
                    }),
                    value: ExpiryStatus.IN_3_MONTH,
                  },
                  {
                    label: t("inventory.tabs.in6Month", {
                      defaultValue: "In 6 Months",
                    }),
                    value: ExpiryStatus.IN_6_MONTH,
                  },
                ]}
              />
            </div>

            <div className="w-[110px] flex-1">
              <MultiSelectField
                name="categoryIds"
                control={control as any}
                label={t("inventory.table.category")}
                options={(categoriesData?.data ?? []).map((c) => ({
                  label: c.name,
                  value: c.id,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden relative min-h-[200px]">
        {isLoading || (isFetchingNextPage && items.length === 0) ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 shadow-sm border-none flex flex-col gap-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-muted rounded-xl" />
                <div className="h-12 bg-muted rounded-xl" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("inventory.emptyInventory")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 shadow-sm"
                onClick={() => router.push("/inventory/category")}
              >
                <Box className="mr-2 h-4 w-4" /> {t("category.moduleName")}
              </Button>
            </div>
            {items.map((item: IInventory) => (
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
            ))}
          </>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">
                {t("inventory.table.item")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("inventory.table.category")}
              </TableHead>
              <TableHead className="font-semibold text-right">
                {t("inventory.table.stockLevel")}
              </TableHead>
              <TableHead className="font-semibold text-right">
                {t("inventory.table.costPrice")}
              </TableHead>
              <TableHead className="font-semibold text-right">
                {t("inventory.table.sellingPrice")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("inventory.table.status")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || (isFetchingNextPage && items.length === 0) ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-16 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                  <TableCell>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("inventory.emptyInventory")}
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
                          {item.sku && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {item.sku}{" "}
                              {item.brand && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  {" " + item.brand}
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm">
                          {item.inventoryCategory?.name || "-"}
                        </span>
                      </div>
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
                          {t("inventory.card.outOfStock")}
                        </Badge>
                      ) : lowStock ? (
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-700 border-none rounded-full px-3 text-[10px] font-bold"
                          >
                            {t("inventory.card.lowStock")}
                          </Badge>
                          {item.expiryDate && (
                            <div className="flex items-center gap-1.5 text-[10px] text-destructive/70 font-semibold">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(item.expiryDate)}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 border-none rounded-full px-3 text-[10px] font-bold"
                          >
                            {t("inventory.card.inStock")}
                          </Badge>
                          {item.expiryDate && (
                            <div className="flex items-center gap-1.5 text-[10px] text-destructive/70 font-semibold">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(item.expiryDate)}</span>
                            </div>
                          )}
                        </div>
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
            {isFetchingNextPage
              ? t("inventory.table.loadingMore")
              : t("inventory.table.showMore")}
          </Button>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                entity: t("inventory.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.message", {
                entity: t("inventory.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={handleDelete}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {hasCreateAccess && (
        <Button
          className="md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg p-0 flex items-center justify-center"
          onClick={() => router.push("/inventory/new")}
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}
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
  const { t } = useTranslation();
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
              {item.sku || t("inventory.card.noSku")}
            </code>
            {item.brand && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {item.brand}
                </span>
              </>
            )}
          </div>
          {item.inventoryCategory && (
            <div className="mt-1">
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[9px] font-bold bg-primary/5 border-primary/20 text-primary/80"
              >
                {item.inventoryCategory.name.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-1 border border-muted/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t("inventory.card.boughtPrice")}
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
              {t("inventory.card.sellingPrice")}
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
            {t("inventory.card.currentStock")}
          </span>
        </div>

        {item.expiryDate && (
          <div className="flex flex-col items-center gap-1.5 ">
            <span className="text-xs text-muted-foreground">
              {" "}
              {t("inventory.card.expiryDate")}
            </span>
            <div className="flex items-center gap-1.5 text-destructive/70">
              <Calendar className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {formatDate(item.expiryDate)}
              </span>
            </div>
          </div>
        )}

        {outOfStock ? (
          <Badge
            variant="destructive"
            className="rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-destructive/20"
          >
            {t("inventory.card.outOfStock")}
          </Badge>
        ) : lowStock ? (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-700 border-none rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-yellow-200"
          >
            {t("inventory.card.lowStock")}
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 border-none rounded-full px-4 h-7 text-[10px] font-bold shadow-sm shadow-green-200"
          >
            {t("inventory.card.inStock")}
          </Badge>
        )}
      </div>
    </div>
  );
}
