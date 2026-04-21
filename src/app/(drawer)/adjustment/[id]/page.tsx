"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useDeleteAdjustment, useFetchAdjustmentById } from "@/api/adjustment/api.adjustment";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/formatter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdjustmentDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const adjustmentId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const [openDelete, setOpenDelete] = React.useState(false);
  const { data, isLoading, isError, refetch } = useFetchAdjustmentById(adjustmentId, canView("INVENTORYADJUSTMENT"));
  const deleteAdjustment = useDeleteAdjustment();

  if (!canView("INVENTORYADJUSTMENT")) return <AccessDeniedView moduleName="Inventory Adjustment" />;
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;
  const adjustment: any = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-2xl font-bold">Adjustment</h1><p className="text-sm text-muted-foreground">{formatDate(adjustment.createdAt)}</p></div>
        </div>
        <div className="flex gap-2">
          {canUpdate("INVENTORYADJUSTMENT") && <Button variant="outline" onClick={() => router.push(`/app/adjustment/${adjustmentId}/edit`)}><Pencil className="mr-2 h-4 w-4" /> Edit</Button>}
          {canDelete("INVENTORYADJUSTMENT") && <Button variant="destructive" onClick={() => setOpenDelete(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div><p className="text-xs text-muted-foreground">Warehouse</p><p>{adjustment.warehouse?.name || "-"}</p></div>
          <div><p className="text-xs text-muted-foreground">Type</p><Badge variant="outline">{adjustment.type}</Badge></div>
          <div><p className="text-xs text-muted-foreground">Note</p><p>{adjustment.note || "No note"}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Inventory</TableHead><TableHead>Quantity</TableHead><TableHead>Destination</TableHead></TableRow></TableHeader>
            <TableBody>
              {(adjustment.items ?? []).length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center">No items.</TableCell></TableRow>
              ) : (
                adjustment.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.inventory?.name || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.toWarehouse?.name || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete adjustment?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteAdjustment.mutate({ id: adjustmentId }, { onSuccess: () => router.push("/app/adjustment") })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
