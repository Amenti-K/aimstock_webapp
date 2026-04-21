"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { useDeleteSale, useFetchSale } from "@/api/sale/api.sale";
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

export default function SalesDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const saleId = id as string;
  const { canView, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("SALES");
  const hasUpdateAccess = canUpdate("SALES");
  const hasDeleteAccess = canDelete("SALES");
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const { data, isLoading, isError, refetch } = useFetchSale(saleId, hasViewAccess);
  const deleteSale = useDeleteSale();

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Sales" />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const sale = data.data;
  const saleItems = sale.saleItems || [];
  const salePayments = sale.salePayments || [];
  const subtotal = saleItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
    0,
  );
  const paidByBank = salePayments.reduce(
    (sum: number, payment: any) => sum + Number(payment.amount || 0),
    0,
  );
  const paidByCash = Number(sale.saleCashPayment?.amount || 0);
  const paidAmount = paidByBank + paidByCash;
  const loanAmount = Number(sale.loan?.amount || 0);
  const soNumber = `SO-${sale.id.slice(-6).toUpperCase()}`;

  const handleDelete = () => {
    deleteSale.mutate(
      { id: saleId },
      {
        onSuccess: () => router.push("/app/sales"),
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
          <span className="hidden sm:inline">Back to Sales</span>
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
                onClick={() => router.push(`/app/sales/${saleId}/edit`)}
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
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                {hasUpdateAccess && (
                  <DropdownMenuItem onClick={() => router.push(`/app/sales/${saleId}/edit`)}>
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
          orderNumber={soNumber}
          partner={sale.partner}
          createdAt={sale.createdAt}
          description={sale.description}
          totalAmount={subtotal}
          paidAmount={paidAmount}
          loanAmount={loanAmount}
          type="sale"
          lastAuditLog={sale.lastAuditLog}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Items List */}
          <div className="lg:col-span-7">
            <ItemList items={saleItems} type="sale" />
          </div>

          {/* Payments List */}
          <div className="lg:col-span-5">
            <PaymentList
              payments={salePayments}
              cashPayment={sale.saleCashPayment}
              loan={sale.loan}
              type="sale"
            />
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete sale <span className="font-bold text-foreground">{soNumber}</span>. This will also remove associated inventory increments and financial records. This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-xl">Keep Sale</AlertDialogCancel>
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
