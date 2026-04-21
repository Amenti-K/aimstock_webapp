"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import {
  useDeletePurchase,
  useFetchPurchase,
} from "@/api/purchase/api.purchase";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
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
import { OrderHeaderCard } from "@/components/common/OrderHeaderCard";
import { ItemList } from "@/components/common/ItemList";
import { PaymentList } from "@/components/common/PaymentList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const purchaseId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("PURCHASE");
  const hasUpdateAccess = canUpdate("PURCHASE");
  const hasDeleteAccess = canDelete("PURCHASE");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const { data, isLoading, isError, refetch } = useFetchPurchase(
    purchaseId,
    hasViewAccess,
  );
  const deletePurchase = useDeletePurchase();

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Purchase" />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const purchase = data.data;
  const purchaseItems = purchase.purchaseItems || [];
  const purchasePayments = purchase.purchasePayments || [];

  const subtotal = purchaseItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
    0,
  );
  const paidByBank = purchasePayments.reduce(
    (sum: number, payment: any) => sum + Number(payment.amount || 0),
    0,
  );
  const paidByCash = Number(purchase.purchaseCashPayment?.amount || 0);
  const paidAmount = paidByBank + paidByCash;
  const loanAmount = Number(purchase.loan?.amount || 0);
  const poNumber = `PO-${purchase.id.slice(-6).toUpperCase()}`;

  const handleDelete = () => {
    deletePurchase.mutate(
      { id: purchaseId },
      {
        onSuccess: () => router.push("/purchase"),
      },
    );
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
          <span className="hidden sm:inline">Back to Purchases</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex items-center gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            {hasUpdateAccess && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => router.push(`/purchase/${purchaseId}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            {hasDeleteAccess && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-xl"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
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
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                {hasUpdateAccess && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/purchase/${purchaseId}/edit`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                )}
                {hasDeleteAccess && (
                  <DropdownMenuItem
                    className="text-destructive font-medium"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="flex flex-col gap-8">
        <OrderHeaderCard
          orderNumber={poNumber}
          partner={purchase.partner}
          createdAt={purchase.createdAt}
          description={purchase.description}
          totalAmount={subtotal}
          paidAmount={paidAmount}
          loanAmount={loanAmount}
          type="purchase"
          lastAuditLog={purchase.lastAuditLog}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Items List - Takes more space on large screens */}
          <div className="lg:col-span-7">
            <ItemList items={purchaseItems} type="purchase" />
          </div>

          {/* Payments List - Right sidebar on large screens */}
          <div className="lg:col-span-5">
            <PaymentList
              payments={purchasePayments}
              cashPayment={purchase.purchaseCashPayment}
              loan={purchase.loan}
              type="purchase"
            />
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete purchase{" "}
              <span className="font-bold text-foreground">{poNumber}</span>.
              This will also remove associated inventory increments and
              financial records. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">
              Keep Purchase
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              onClick={handleDelete}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
