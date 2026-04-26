"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useFetchWarehouseById,
  useUpdateWarehouse,
} from "@/api/warehouse/api.warehouse";
import WarehouseForm from "@/components/forms/warehouse/WarehouseForm";
import { WarehouseFormValues } from "@/components/forms/warehouse/warehouse.schema";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function EditWarehousePage() {
  const { t } = useTranslation("warehouse");
  const router = useRouter();
  const { id } = useParams();
  const warehouseId = id as string;
  const { canUpdate } = usePermissions();
  if (!canUpdate("WAREHOUSES"))
    return <AccessDeniedView moduleName={t("moduleName")} />;

  const { data, isLoading, isError, refetch } = useFetchWarehouseById(
    warehouseId,
    true,
  );
  const updateWarehouse = useUpdateWarehouse(warehouseId);
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("form.editWare")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("detail.title") || "Update warehouse information."}
          </p>
        </div>
      </div>
      <WarehouseForm
        initialData={data.data}
        isPending={updateWarehouse.isPending}
        submitLabel={t("form.editWare")}
        onSubmit={(values: WarehouseFormValues) =>
          updateWarehouse.mutate(values as any, {
            onSuccess: () => router.push(`/warehouse/${warehouseId}`),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
