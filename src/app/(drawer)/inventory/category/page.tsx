"use client";

import React, { useState, useMemo } from "react";
import {
  useFetchCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/api/inventory/api.inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tag,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronRight,
  FolderOpen,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import CategoryForm from "@/components/forms/category/categoryForm";
import { IInventoryCategory } from "@/components/interface/inventory/inventory.interface";
import { InventoryCategoryFormValues } from "@/components/schema/inventory.schema";

export default function CategoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("INVENTORY");
  const hasCreateAccess = canCreate("INVENTORY");
  const hasUpdateAccess = canUpdate("INVENTORY");
  const hasDeleteAccess = canDelete("INVENTORY");

  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<IInventoryCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data, isLoading } = useFetchCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory(editingCategory?.id ?? "");
  const deleteCategory = useDeleteCategory(deletingId ?? "");

  const filteredCategories = useMemo(() => {
    const cats = data?.data ?? [];
    if (!search.trim()) return cats;
    return cats.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, search]);

  const openCreate = () => {
    setEditingCategory(null);
    setIsSheetOpen(true);
  };

  const openEdit = (cat: IInventoryCategory) => {
    setEditingCategory(cat);
    setIsSheetOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (values: InventoryCategoryFormValues) => {
    if (editingCategory) {
      updateCategory.mutate(values, {
        onSuccess: () => {
          setIsSheetOpen(false);
          setEditingCategory(null);
        },
      });
    } else {
      createCategory.mutate(values, {
        onSuccess: () => {
          setIsSheetOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteCategory.mutate({} as any, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setDeletingId(null);
      },
    });
  };

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("category.moduleName")} />;
  }

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative">
      {/* Desktop Header */}
      <div className="hidden md:flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => router.push("/inventory")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Tag className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t("category.moduleName")}
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground ml-14">
            {t("category.description")}
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
            onClick={openCreate}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("category.form.add")}
          </Button>
        )}
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center gap-3 pt-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0"
          onClick={() => router.push("/inventory")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight leading-none">
            {t("category.moduleName")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("category.description")}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="p-4 bg-card rounded-2xl border-none shadow-sm">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("category.form.searchPlaceholder")}
            className="pl-8 bg-muted/30 border-none shadow-none focus-visible:ring-1 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile: Card list */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 shadow-sm animate-pulse flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-xl bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-card rounded-2xl border border-dashed">
            <FolderOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              {t("category.emptyCategory")}
            </p>
            {hasCreateAccess && (
              <Button
                size="sm"
                className="mt-4 rounded-full"
                onClick={openCreate}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("category.form.add")}
              </Button>
            )}
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <CategoryMobileCard
              key={cat.id}
              category={cat}
              hasUpdateAccess={hasUpdateAccess}
              hasDeleteAccess={hasDeleteAccess}
              onEdit={() => openEdit(cat)}
              onDelete={() => openDelete(cat.id)}
              onClick={() => router.push(`/inventory/category/${cat.id}`)}
            />
          ))
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold">
                {t("category.table.name")}
              </TableHead>
              <TableHead className="font-semibold">
                {t("category.table.description")}
              </TableHead>
              <TableHead className="font-semibold text-right">
                {t("category.table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-64 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-32 text-center text-muted-foreground"
                >
                  {t("category.emptyCategory")}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors group"
                  onClick={() => router.push(`/inventory/category/${cat.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {hasUpdateAccess && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {hasDeleteAccess && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                          onClick={() => openDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile FAB */}
      {hasCreateAccess && (
        <Button
          className="md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg p-0 flex items-center justify-center"
          onClick={openCreate}
        >
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      )}

      {/* Create / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
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
                <SheetTitle>
                  {editingCategory
                    ? t("category.form.edit")
                    : t("category.form.add")}
                </SheetTitle>
                <SheetDescription className="text-xs mt-0.5">
                  {t("category.description")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleSubmit}
            onCancel={() => setIsSheetOpen(false)}
            isPending={isPending}
            submitLabel={
              editingCategory ? t("common.save") : t("category.form.add")
            }
          />
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                entity: t("category.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.message", {
                entity: t("category.moduleName"),
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
    </div>
  );
}

function CategoryMobileCard({
  category,
  hasUpdateAccess,
  hasDeleteAccess,
  onEdit,
  onDelete,
  onClick,
}: {
  category: IInventoryCategory;
  hasUpdateAccess: boolean;
  hasDeleteAccess: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-card rounded-2xl p-4 shadow-sm border-none flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Tag className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-base truncate leading-tight">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {category.description}
          </p>
        )}
      </div>
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {hasUpdateAccess && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {hasDeleteAccess && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-1" />
      </div>
    </div>
  );
}
