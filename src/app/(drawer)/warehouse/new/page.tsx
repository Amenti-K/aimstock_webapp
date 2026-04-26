"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCreateWarehouse } from "@/api/warehouse/api.warehouse";
import WarehouseForm from "@/components/forms/warehouse/WarehouseForm";
import { WarehouseFormValues } from "@/components/forms/warehouse/warehouse.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function NewWarehousePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canCreate } = usePermissions();
  const createWarehouse = useCreateWarehouse();
  if (!canCreate("WAREHOUSES"))
    return <AccessDeniedView moduleName={t("warehouse.moduleName")} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("warehouse.form.addWare")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouse.description")}
          </p>
        </div>
      </div>
      <WarehouseForm
        isPending={createWarehouse.isPending}
        submitLabel={t("warehouse.form.addWare")}
        onSubmit={(values: WarehouseFormValues) =>
          createWarehouse.mutate(values as any, {
            onSuccess: () => router.push("/warehouse"),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
