"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFetchAdjustmentById, useUpdateAdjustment } from "@/api/adjustment/api.adjustment";
import AdjustmentForm from "@/components/forms/adjustment/AdjustmentForm";
import { AdjustmentFormValues } from "@/components/forms/adjustment/adjustment.schema";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function EditAdjustmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const adjustmentId = id as string;
  const { canUpdate } = usePermissions();
  if (!canUpdate("INVENTORYADJUSTMENT")) return <AccessDeniedView moduleName="Inventory Adjustment" />;

  const { data, isLoading, isError, refetch } = useFetchAdjustmentById(adjustmentId, true);
  const updateAdjustment = useUpdateAdjustment(adjustmentId);
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Edit Adjustment</h1><p className="text-sm text-muted-foreground">Update adjustment and its items.</p></div>
      </div>
      <AdjustmentForm
        initialData={data.data}
        isPending={updateAdjustment.isPending}
        submitLabel="Save changes"
        onSubmit={(values: AdjustmentFormValues) => updateAdjustment.mutate(values as any, { onSuccess: () => router.push(`/app/adjustment/${adjustmentId}`) })}
        onCancel={() => router.back()}
      />
    </div>
  );
}
