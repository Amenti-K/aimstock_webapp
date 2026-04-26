"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/inventory/InventoryForm";
import { useCreateInventory } from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import type { inventoryFormValues } from "@/components/schema/inventory.schema";
import { useTranslation } from "react-i18next";

export default function NewInventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canCreate } = usePermissions();
  const hasCreateAccess = canCreate("INVENTORY");
  const createInventory = useCreateInventory();

  if (!hasCreateAccess) {
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-1">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 border-none bg-card shadow-sm hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {t("inventory.form.add")}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              {t("inventory.description")}
            </p>
          </div>
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
