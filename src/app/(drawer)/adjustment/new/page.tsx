"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateAdjustment } from "@/api/adjustment/api.adjustment";
import AdjustmentForm from "@/components/forms/adjustment/AdjustmentForm";
import { AdjustmentFormValues } from "@/components/forms/adjustment/adjustment.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const createAdjustment = useCreateAdjustment();
  if (!canCreate("INVENTORYADJUSTMENT"))
    return <AccessDeniedView moduleName="Inventory Adjustment" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Adjustment
          </h1>
          <p className="text-sm text-muted-foreground">
            Select source/type first, then add items.
          </p>
        </div>
      </div>
      <AdjustmentForm
        isPending={createAdjustment.isPending}
        submitLabel="Save adjustment"
        onSubmit={(values: AdjustmentFormValues) =>
          createAdjustment.mutate(values as any, {
            onSuccess: () => router.push("/adjustment"),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
