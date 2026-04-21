"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/inventory/InventoryForm";
import {
  useFetchInventory,
  useUpdateInventory,
} from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import type { inventoryFormValues } from "@/components/schema/inventory.schema";

export default function EditInventoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const inventoryId = id as string;
  const { canUpdate } = usePermissions();
  const hasUpdateAccess = canUpdate("INVENTORY");
  const updateInventory = useUpdateInventory(inventoryId);
  const { data, isLoading, isError, refetch } = useFetchInventory(
    inventoryId,
    hasUpdateAccess,
  );

  if (!hasUpdateAccess) {
    return <AccessDeniedView moduleName="Inventory" />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Update inventory data and allowed distribution fields.
          </p>
        </div>
      </div>

      <InventoryForm
        isEdit
        initialData={data.data}
        isLoading={updateInventory.isPending}
        onSubmit={(payload: inventoryFormValues) =>
          updateInventory.mutate(payload, {
            onSuccess: () => router.push(`/app/inventory/${inventoryId}`),
          })
        }
      />
    </div>
  );
}
