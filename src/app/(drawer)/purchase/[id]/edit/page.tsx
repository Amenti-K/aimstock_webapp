"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PurchaseForm from "@/components/purchase/PurchaseForm";
import {
  useFetchPurchase,
  useUpdatePurchase,
} from "@/api/purchase/api.purchase";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { INewPurchase } from "@/components/interface/purchase/purchase.interface";

export default function EditPurchasePage() {
  const { id } = useParams();
  const router = useRouter();
  const purchaseId = id as string;
  const { canUpdate } = usePermissions();
  const hasUpdateAccess = canUpdate("PURCHASE");
  const updatePurchase = useUpdatePurchase(purchaseId);
  const { data, isLoading, isError, refetch } = useFetchPurchase(
    purchaseId,
    hasUpdateAccess,
  );

  if (!hasUpdateAccess) {
    return <AccessDeniedView moduleName="Purchase" />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const handleSubmit = (payload: INewPurchase) => {
    updatePurchase.mutate(payload as any, {
      onSuccess: () => router.push(`/purchase/${purchaseId}`),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Purchase</h1>
          <p className="text-sm text-muted-foreground">
            Update purchase data for this transaction.
          </p>
        </div>
      </div>

      <PurchaseForm
        initialData={data.data}
        isLoading={updatePurchase.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
