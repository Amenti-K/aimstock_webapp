"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Warehouse,
  MapPin,
  Phone,
  ShieldCheck,
  Globe,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  AlertCircle,
  History,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import {
  useDeleteWarehouse,
  useFetchWarehouseById,
} from "@/api/warehouse/api.warehouse";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatter";

export default function WarehouseDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const warehouseId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);
  const { data, isLoading, isError, refetch } = useFetchWarehouseById(
    warehouseId,
    canView("WAREHOUSES"),
  );
  const deleteWarehouse = useDeleteWarehouse();

  // Aggregated transactions sorted by date
  // Moved up to follow Rules of Hooks
  const aggregatedTransactions = useMemo(() => {
    if (!data?.data) return [];
    
    const warehouse = data.data;
    const purchases = (warehouse.purchaseItems || []).map((p) => ({
      ...p,
      type: "PURCHASE",
    }));
    const sales = (warehouse.saleItems || []).map((s) => ({
      ...s,
      type: "SALE",
    }));
    return [...purchases, ...sales].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data?.data]);

  if (!canView("WAREHOUSES"))
    return <AccessDeniedView moduleName="Warehouses" />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;
  
  const warehouse = data.data;
  const totalTransactions =
    (warehouse.purchaseItems?.length || 0) + (warehouse.saleItems?.length || 0);

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {warehouse.name}
              </h1>
              {warehouse.isInternal ? (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-none rounded-full px-3 text-[10px] font-bold">
                  INTERNAL
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full px-3 text-[10px] font-bold"
                >
                  EXTERNAL
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {warehouse.location || "No location specified"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate("WAREHOUSES") && (
            <Button
              variant="outline"
              onClick={() => router.push(`/app/warehouse/${warehouseId}/edit`)}
              className="rounded-full shadow-sm"
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          )}
          {canDelete("WAREHOUSES") && (
            <Button
              variant="destructive"
              onClick={() => setOpenDelete(true)}
              className="rounded-full shadow-sm"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Top Overview: Next to each other on desktop */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden font-medium">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-primary" />
              Warehouse Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Contact Phone
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Phone className="h-4 w-4" />
                  {warehouse.contactPhone || "Not provided"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Last Audit
                </span>
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {warehouse.lastAuditLog
                    ? formatDate(warehouse.lastAuditLog.createdAt)
                    : "Never"}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Description
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {warehouse.description ||
                  "No description provided for this warehouse."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-primary/5 dark:bg-primary/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70">
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background p-3 rounded-xl shadow-sm border border-primary/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <ArrowDownLeft className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">
                    Purchases
                  </span>
                </div>
                <span className="text-xl font-black">
                  {warehouse.purchaseItems?.length || 0}
                </span>
              </div>
              <div className="bg-background p-3 rounded-xl shadow-sm border border-primary/10">
                <div className="flex items-center gap-1.5 text-primary mb-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-[10px] font-bold uppercase">
                    Sales
                  </span>
                </div>
                <span className="text-xl font-black">
                  {warehouse.saleItems?.length || 0}
                </span>
              </div>
            </div>
            <div className="bg-primary text-primary-foreground p-4 rounded-xl flex items-center justify-between shadow-lg shadow-primary/20">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-80">
                  Total Transactions
                </span>
                <span className="text-2xl font-black">
                  {totalTransactions}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Tabs widening the whole width */}
      <div className="w-full">
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-2xl mb-4 h-12 w-full max-w-md border border-muted-foreground/10">
            <TabsTrigger
              value="inventory"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <Boxes className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm px-6 font-bold text-xs uppercase transition-all flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs font-bold uppercase opacity-60">
                        Item Name
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase opacity-60">
                        SKU
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase opacity-60 text-right">
                        Quantity
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase opacity-60 text-center">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(warehouse.warehouseInventories ?? []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-medium">
                              No items found in this warehouse
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      warehouse.warehouseInventories.map((item: any) => {
                        const lowStock = item.quantity <= item.reorderQuantity;
                        const outOfStock = item.quantity <= 0;

                        return (
                          <TableRow
                            key={item.id}
                            className="hover:bg-muted/20 cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/app/inventory/${item.inventory?.id}`,
                              )
                            }
                          >
                            <TableCell className="font-semibold text-sm">
                              {item.inventory?.name || "-"}
                            </TableCell>
                            <TableCell>
                              <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                                {item.inventory?.sku || "NO-SKU"}
                              </code>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span
                                  className={cn(
                                    "font-bold text-base",
                                    outOfStock
                                      ? "text-destructive"
                                      : lowStock
                                        ? "text-yellow-600"
                                        : "text-foreground",
                                  )}
                                >
                                  {item.quantity.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">
                                  {item.inventory?.unit || "Units"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {outOfStock ? (
                                <Badge
                                  variant="destructive"
                                  className="rounded-full h-6 text-[9px] font-black uppercase"
                                >
                                  Out
                                </Badge>
                              ) : lowStock ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 h-6 text-[9px] font-black uppercase border-none"
                                >
                                  Low
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 h-6 text-[9px] font-black uppercase border-none"
                                >
                                  Ok
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
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-xs font-bold uppercase opacity-60">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase opacity-60">
                        Type
                      </TableHead>
                      <TableHead className="text-xs font-bold uppercase opacity-60">
                        Reference ID
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aggregatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <History className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-medium">
                              No transactions recorded
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      aggregatedTransactions.map((tx: any) => (
                        <TableRow
                          key={tx.id}
                          className="hover:bg-muted/20 cursor-pointer group"
                          onClick={() =>
                            router.push(
                              `/app/${tx.type.toLowerCase() === "purchase" ? "purchase" : "sales"}/${tx.id}`,
                            )
                          }
                        >
                          <TableCell className="font-semibold text-sm">
                            {formatDate(tx.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-black uppercase rounded-full px-3",
                                tx.type === "SALE"
                                  ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20"
                                  : "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20",
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {tx.type === "SALE" ? (
                                  <ShoppingBag className="h-3 w-3" />
                                ) : (
                                  <ShoppingCart className="h-3 w-3" />
                                )}
                                {tx.type}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase">
                              #{tx.id.slice(-8)}
                            </code>
                          </TableCell>
                          <TableCell>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete warehouse?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All inventory records associated
              with this warehouse will be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
              onClick={() =>
                deleteWarehouse.mutate({ id: warehouseId } as any, {
                  onSuccess: () => router.push("/app/warehouse"),
                })
              }
            >
              Delete Warehouse
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
