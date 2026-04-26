"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3 } from "lucide-react";
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
import { useTranslation } from "react-i18next";

export default function EditInventoryPage() {
  const { t } = useTranslation();
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
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

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
              <Edit3 className="h-5 w-5 text-primary" />
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {t("inventory.form.edit")}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              {data.data.name}
            </p>
          </div>
        </div>
      </div>

      <InventoryForm
        isEdit
        initialData={data.data}
        isLoading={updateInventory.isPending}
        onSubmit={(payload: inventoryFormValues) =>
          updateInventory.mutate(payload, {
            onSuccess: () => router.push(`/inventory/${inventoryId}`),
          })
        }
      />
    </div>
  );
}
