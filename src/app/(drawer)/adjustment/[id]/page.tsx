"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Warehouse,
  Info,
  Package,
  MapPin,
} from "lucide-react";
import {
  useDeleteAdjustment,
  useFetchAdjustmentById,
} from "@/api/adjustment/api.adjustment";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/formatter";
import { useLanguage } from "@/hooks/language.hook";

export default function AdjustmentDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useParams();
  const adjustmentId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("INVENTORYADJUSTMENT");
  const hasUpdateAccess = canUpdate("INVENTORYADJUSTMENT");
  const hasDeleteAccess = canDelete("INVENTORYADJUSTMENT");

  const [openDelete, setOpenDelete] = React.useState(false);
  const { data, isLoading, isError, refetch } = useFetchAdjustmentById(
    adjustmentId,
    hasViewAccess,
  );
  const deleteAdjustment = useDeleteAdjustment();

  if (!hasViewAccess)
    return <AccessDeniedView moduleName={t("adjustment.moduleName")} />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const adjustment: any = data.data;

  const handleDelete = () => {
    deleteAdjustment.mutate(
      { id: adjustmentId },
      { onSuccess: () => router.push("/adjustment") },
    );
  };

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
    <div className="flex flex-col gap-8 pb-10">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl hover:bg-card"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {t("common.back")} to {t("adjustment.moduleName")}
          </span>
          <span className="sm:hidden">{t("common.back")}</span>
        </Button>

        <div className="flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {hasUpdateAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => router.push(`/adjustment/${adjustmentId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </Button>
            )}
            {hasDeleteAccess && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={() => setOpenDelete(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </Button>
            )}
          </div>

          {/* Mobile Actions Overlay */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 rounded-xl bg-card"
              >
                {hasUpdateAccess && (
                  <DropdownMenuItem
                    onClick={() =>
                      router.push(`/adjustment/${adjustmentId}/edit`)
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                  </DropdownMenuItem>
                )}
                {hasDeleteAccess && (
                  <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => setOpenDelete(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 ">
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
              <div className="flex items-center justify-between w-full">
                <div className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {t("adjustment.card.adjustment")}
                </div>
                {getTypeBadge(adjustment.type)}
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-24">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {t("adjustment.form.sourceWarehouse")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {adjustment.warehouse?.name || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {t("common.date")}
                    </p>
                    <p className="font-semibold text-foreground">
                      {formatDate(adjustment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {adjustment.note && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    {t("adjustment.form.notes")}
                  </p>
                  <p className="text-sm bg-muted/30 p-3 rounded-xl border italic text-muted-foreground">
                    "{adjustment.note}"
                  </p>
                </div>
              )}
            </CardContent>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b flex items-center gap-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {t("adjustment.detail.allItems")}
              </CardTitle>
            </div>
            <CardContent className="p-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="pl-6">
                        {t("adjustment.detail.item")}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("adjustment.detail.qty")}
                      </TableHead>
                      {adjustment.type === "TRANSFER" && (
                        <TableHead className="pl-6">
                          {t("adjustment.detail.dest")}
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(adjustment.items ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={adjustment.type === "TRANSFER" ? 3 : 2}
                          className="h-32 text-center text-muted-foreground"
                        >
                          {t("adjustment.detail.noItems")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustment.items.map((item: any) => (
                        <TableRow
                          key={item.id}
                          className="group transition-colors"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Package className="h-4 w-4" />
                              </div>
                              <span className="font-semibold">
                                {item.inventory?.name || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4 font-bold tabular-nums">
                            {item.quantity}
                          </TableCell>
                          {adjustment.type === "TRANSFER" && (
                            <TableCell className="pl-6 py-4">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{item.toWarehouse?.name || "-"}</span>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>
        </div>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                entity: t("adjustment.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.message", {
                entity: t("adjustment.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
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
