"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/inventory/InventoryForm";
import { useCreateInventory } from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import type { inventoryFormValues } from "@/components/schema/inventory.schema";

export default function NewInventoryPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const hasCreateAccess = canCreate("INVENTORY");
  const createInventory = useCreateInventory();

  if (!hasCreateAccess) {
    return <AccessDeniedView moduleName="Inventory" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Create a new inventory item with warehouse distribution.
          </p>
        </div>
      </div>

      <InventoryForm
        isLoading={createInventory.isPending}
        onSubmit={(payload: inventoryFormValues) =>
          createInventory.mutate(payload, {
            onSuccess: () => router.push("/inventory"),
          })
        }
      />
    </div>
  );
}
