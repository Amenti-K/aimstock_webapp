"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesForm from "@/components/sales/SalesForm";
import {
  useFetchSale,
  useUpdateSale,
  type INewSale,
} from "@/api/sale/api.sale";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";

export default function EditSalesPage() {
  const { id } = useParams();
  const router = useRouter();
  const saleId = id as string;
  const { canUpdate } = usePermissions();
  const hasUpdateAccess = canUpdate("SALES");
  const updateSale = useUpdateSale(saleId);
  const { data, isLoading, isError, refetch } = useFetchSale(
    saleId,
    hasUpdateAccess,
  );

  if (!hasUpdateAccess) {
    return <AccessDeniedView moduleName="Sales" />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  const handleSubmit = (payload: INewSale) => {
    updateSale.mutate(payload as any, {
      onSuccess: () => router.push(`/app/sales/${saleId}`),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Sale</h1>
          <p className="text-sm text-muted-foreground">
            Update sale data for this transaction.
          </p>
        </div>
      </div>

      <SalesForm
        initialData={data.data}
        isLoading={updateSale.isPending}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
