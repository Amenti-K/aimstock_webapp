"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  useFetchAdjustmentById,
  useUpdateAdjustment,
} from "@/api/adjustment/api.adjustment";
import AdjustmentForm from "@/components/forms/adjustment/AdjustmentForm";
import { AdjustmentFormValues } from "@/components/forms/adjustment/adjustment.schema";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/language.hook";

export default function EditAdjustmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { id } = useParams();
  const adjustmentId = id as string;
  const { canUpdate } = usePermissions();

  if (!canUpdate("INVENTORYADJUSTMENT"))
    return <AccessDeniedView moduleName={t("adjustment.moduleName")} />;

  const { data, isLoading, isError, refetch } = useFetchAdjustmentById(
    adjustmentId,
    true,
  );
  
  const updateAdjustment = useUpdateAdjustment(adjustmentId);

  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Action Bar */}
      <div className="flex items-center px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="rounded-xl hover:bg-card"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">
            {t("common.back")} to {t("adjustment.card.adjustment")}
          </span>
          <span className="sm:hidden">{t("common.back")}</span>
        </Button>
      </div>

      <div className="space-y-6 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("adjustment.form.editAdjustment")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adjustment.form.basicInfoDescription")}
          </p>
        </div>
        
        <AdjustmentForm
          item={data.data}
          isPending={updateAdjustment.isPending}
          onSubmit={(values: AdjustmentFormValues) =>
            updateAdjustment.mutate(values as any, {
              onSuccess: () => router.push(`/adjustment/${adjustmentId}`),
            })
          }
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
