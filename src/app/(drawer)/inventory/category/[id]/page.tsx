"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useFetchCategories,
  useGetInventoriesInfinite,
  useUpdateCategory,
  useAssignInventoriesToCategory,
  useFetchInventorySelector,
  useUnassignInventoryCategory,
} from "@/api/inventory/api.inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Tag,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Pencil,
} from "lucide-react";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import CategoryForm from "@/components/forms/category/categoryForm";
import {
  IInventory,
  IInventorySelector,
} from "@/components/interface/inventory/inventory.interface";
import { InventoryCategoryFormValues } from "@/components/schema/inventory.schema";
import { formatCurrency } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { InfiniteScrollTrigger } from "@/components/common/InfiniteScrollTrigger";

// ─── Remove button as its own component so the hook call is at top-level ──────
function RemoveInventoryButton({
  inventoryId,
  categoryId,
  label,
  onRemoved,
}: {
  inventoryId: string;
  categoryId: string;
  label: string;
  onRemoved?: () => void;
}) {
  const { mutate, isPending } = useUnassignInventoryCategory();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full text-xs h-8"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        mutate({ categoryId, inventoryId }, { onSuccess: onRemoved });
      }}
    >
      <Trash2 className="h-3.5 w-3.5 mr-1" />
      {label}
    </Button>
  );
}

// ─── Add row inside dialog – handles selection ────────────────────────────────
function SelectableInventoryRow({
  item,
  isSelected,
  onToggle,
}: {
  item: IInventorySelector;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const totalQty = item.warehouseInventories.reduce(
    (acc, w) => acc + Number(w.quantity),
    0,
  );
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-muted cursor-pointer",
        isSelected && "bg-primary/5 border-primary/20",
      )}
      onClick={onToggle}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        className="rounded-full"
      />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
        <Package className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {item.inventoryCategory?.name ?? "—"} · {totalQty.toLocaleString()}{" "}
          {item.unit}
        </p>
      </div>
    </div>
  );
}

// ─── Mobile inventory card inside a category ──────────────────────────────────
function InventoryMobileCard({
  item,
  hasUpdateAccess,
  categoryId,
  onClick,
  onRemoved,
}: {
  item: IInventory;
  hasUpdateAccess: boolean;
  categoryId: string;
  onClick: () => void;
  onRemoved: () => void;
}) {
  const { t } = useTranslation();
  const totalQty = item.warehouseInventories.reduce(
    (acc, w) => acc + Number(w.quantity),
    0,
  );
  const totalReorder = item.warehouseInventories.reduce(
    (acc, w) => acc + Number(w.reorderQuantity),
    0,
  );
  const low = totalQty <= totalReorder;
  const out = totalQty <= 0;

  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{item.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {item.sku ?? "NO-SKU"}
            </code>
            {out ? (
              <Badge
                variant="destructive"
                className="rounded-full text-[9px] px-2 h-4 font-bold"
              >
                {t("inventory.card.outOfStock")}
              </Badge>
            ) : low ? (
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-700 border-none rounded-full text-[9px] px-2 h-4 font-bold"
              >
                {t("inventory.card.lowStock")}
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-none rounded-full text-[9px] px-2 h-4 font-bold"
              >
                {t("inventory.card.inStock")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-xl p-2.5 flex flex-col gap-0.5 border border-muted/50">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingDown className="h-3 w-3" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {t("inventory.card.boughtPrice")}
            </span>
          </div>
          <span className="text-sm font-bold">
            {formatCurrency(item.boughtPrice)}
          </span>
        </div>
        <div className="bg-primary/5 rounded-xl p-2.5 flex flex-col gap-0.5 border border-primary/10">
          <div className="flex items-center gap-1 text-primary/70">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              {t("inventory.card.sellingPrice")}
            </span>
          </div>
          <span className="text-sm font-bold text-primary">
            {formatCurrency(item.sellingPrice)}
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-between pt-2 border-t border-dashed"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xl font-black",
              out
                ? "text-destructive"
                : low
                  ? "text-yellow-600"
                  : "text-foreground",
            )}
          >
            {totalQty.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase">
            {item.unit} · {t("inventory.card.currentStock")}
          </span>
        </div>
        {hasUpdateAccess && (
          <RemoveInventoryButton
            inventoryId={item.id}
            categoryId={categoryId}
            label={t("category.detail.removeInventory")}
            onRemoved={onRemoved}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { canView, canUpdate } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const hasUpdateAccess = canUpdate("INVENTORY");

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Find the category from the list (avoids needing a separate GET /category/:id)
  const { data: categoriesData, isLoading: loadingCategory } =
    useFetchCategories();
  const category = useMemo(
    () => categoriesData?.data?.find((c) => c.id === id),
    [categoriesData, id],
  );

  const updateCategory = useUpdateCategory(id);
  const assignInventoriesMutation = useAssignInventoriesToCategory(id);

  // Inventories belonging to this category
  const {
    data: catInvData,
    isLoading: loadingInventories,
    refetch: refetchInventories,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetInventoriesInfinite(hasViewAccess && !!id, { categoryIds: [id] });

  const inventories: IInventory[] = useMemo(
    () => catInvData?.pages?.flatMap((p) => (p as any).data) ?? [],
    [catInvData],
  );

  // Inventories without a category for "Add" dialog (only fetched when dialog is open)
  const { data: allData, isLoading: loadingAll } = useFetchInventorySelector(
    hasViewAccess && isAddOpen,
  );

  const availableInventories: IInventorySelector[] = useMemo(
    () => allData?.data ?? [],
    [allData],
  );

  const handleEditSubmit = (values: InventoryCategoryFormValues) => {
    updateCategory.mutate(values, { onSuccess: () => setIsEditOpen(false) });
  };

  const handleToggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleConfirmAdd = () => {
    if (selectedIds.size === 0) return;
    assignInventoriesMutation.mutate(
      { inventoryIds: Array.from(selectedIds) },
      {
        onSuccess: () => {
          setIsAddOpen(false);
          setSelectedIds(new Set());
        },
      },
    );
  };

  useEffect(() => {
    if (!isAddOpen) {
      setSelectedIds(new Set());
    }
  }, [isAddOpen]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("category.moduleName")} />;
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => router.push("/inventory/category")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {loadingCategory ? (
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded" />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary shrink-0">
                <Tag className="h-4 w-4" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                {category?.name ?? "—"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 ml-8">
              {t("category.detail.inventories")}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {hasUpdateAccess && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {hasUpdateAccess && (
            <Button
              size="sm"
              className="rounded-full hidden sm:flex"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              {t("category.detail.addInventory")}
            </Button>
          )}
        </div>
      </div>

      {/* inventory count chip */}
      {!loadingInventories && (
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
          <Package className="mr-1.5 h-3 w-3" />
          {inventories.length} {t("category.table.itemCount")}
        </Badge>
      )}

      {/* ── Mobile cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {loadingInventories ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 shadow-sm animate-pulse space-y-3"
            >
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 bg-muted rounded-xl" />
                <div className="h-12 bg-muted rounded-xl" />
              </div>
            </div>
          ))
        ) : inventories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-card rounded-2xl border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground font-medium">
              {t("category.emptyInventory")}
            </p>
            {hasUpdateAccess && (
              <Button
                size="sm"
                className="mt-4 rounded-full"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("category.detail.addInventory")}
              </Button>
            )}
          </div>
        ) : (
          inventories.map((item) => (
            <InventoryMobileCard
              key={item.id}
              item={item}
              categoryId={id}
              hasUpdateAccess={hasUpdateAccess}
              onClick={() => router.push(`/inventory/${item.id}`)}
              onRemoved={() => {
                refetchInventories();
              }}
            />
          ))
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────────────────────── */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">
                {t("inventory.table.item")}
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
              {hasUpdateAccess && (
                <TableHead className="font-semibold text-right">
                  {t("category.table.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingInventories ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: hasUpdateAccess ? 6 : 5 }).map(
                    (__, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            ) : inventories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={hasUpdateAccess ? 6 : 5}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("category.emptyInventory")}
                </TableCell>
              </TableRow>
            ) : (
              inventories.map((item) => {
                const totalQty = item.warehouseInventories.reduce(
                  (a, w) => a + Number(w.quantity),
                  0,
                );
                const totalReorder = item.warehouseInventories.reduce(
                  (a, w) => a + Number(w.reorderQuantity),
                  0,
                );
                const low = totalQty <= totalReorder;
                const out = totalQty <= 0;
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          {item.sku && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              {item.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-bold text-sm",
                          out
                            ? "text-destructive"
                            : low
                              ? "text-yellow-600"
                              : "",
                        )}
                      >
                        {totalQty.toLocaleString()}{" "}
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {item.unit}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">
                      {formatCurrency(item.boughtPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm text-primary">
                      {formatCurrency(item.sellingPrice)}
                    </TableCell>
                    <TableCell>
                      {out ? (
                        <Badge
                          variant="destructive"
                          className="rounded-full px-3 text-[10px] font-bold"
                        >
                          {t("inventory.card.outOfStock")}
                        </Badge>
                      ) : low ? (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 border-none rounded-full px-3 text-[10px] font-bold"
                        >
                          {t("inventory.card.lowStock")}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 border-none rounded-full px-3 text-[10px] font-bold"
                        >
                          {t("inventory.card.inStock")}
                        </Badge>
                      )}
                    </TableCell>
                    {hasUpdateAccess && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end">
                          <RemoveInventoryButton
                            inventoryId={item.id}
                            categoryId={id}
                            label={t("category.detail.removeInventory")}
                            onRemoved={() => {
                              refetchInventories();
                            }}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InfiniteScrollTrigger
        hasNextPage={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onIntersect={fetchNextPage}
      />

      {/* Mobile FAB */}
      {hasUpdateAccess && (
        <Button
          className="md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg p-0"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* ── Edit Sheet ─────────────────────────────────────────────────────── */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl px-6 pb-20 max-h-[90dvh] overflow-y-auto"
        >
          <SheetHeader className="">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle>{t("category.form.edit")}</SheetTitle>
                <SheetDescription className="text-xs">
                  {category?.name}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <CategoryForm
            initialData={category ?? null}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditOpen(false)}
            isPending={updateCategory.isPending}
            submitLabel={t("common.save")}
          />
        </SheetContent>
      </Sheet>

      {/* ── Add Inventory Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setAddSearch("");
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85dvh] flex flex-col gap-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>
                  {t("category.detail.addInventoryTitle")}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {t("category.detail.addInventoryDescription")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("inventory.form.searchPlaceholder")}
              className="pl-8 bg-muted/30 border-none shadow-none h-9"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 min-h-[200px]">
            {loadingAll ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl animate-pulse"
                >
                  <div className="h-10 w-10 bg-muted rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-1/3 bg-muted rounded" />
                  </div>
                </div>
              ))
            ) : availableInventories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t("inventory.emptyInventory")}
                </p>
              </div>
            ) : (
              <>
                {availableInventories.map((inv) => (
                  <SelectableInventoryRow
                    key={inv.id}
                    item={inv}
                    isSelected={selectedIds.has(inv.id)}
                    onToggle={() => handleToggleSelection(inv.id)}
                  />
                ))}
              </>
            )}
          </div>
          <DialogFooter className="flex flex-row items-center justify-between gap-4 border-t pt-4">
            <div className="text-xs text-muted-foreground">
              {selectedIds.size}{" "}
              {t("common.selected", { defaultValue: "selected" })}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-6"
                onClick={() => setIsAddOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="rounded-full px-6"
                disabled={
                  selectedIds.size === 0 || assignInventoriesMutation.isPending
                }
                onClick={handleConfirmAdd}
              >
                {assignInventoriesMutation.isPending
                  ? t("common.saving")
                  : t("common.add")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
