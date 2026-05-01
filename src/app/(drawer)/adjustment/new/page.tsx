"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateAdjustment } from "@/api/adjustment/api.adjustment";
import AdjustmentForm from "@/components/forms/adjustment/AdjustmentForm";
import { AdjustmentFormValues } from "@/components/forms/adjustment/adjustment.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/language.hook";

export default function NewAdjustmentPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { canCreate } = usePermissions();
  const createAdjustment = useCreateAdjustment();

  if (!canCreate("INVENTORYADJUSTMENT"))
    return <AccessDeniedView moduleName={t("adjustment.moduleName")} />;

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
            {t("adjustment.form.addAdjustment")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("adjustment.form.basicInfoDescription")}
          </p>
        </div>
        
        <AdjustmentForm
          isPending={createAdjustment.isPending}
          onSubmit={(values: AdjustmentFormValues) =>
            createAdjustment.mutate(values as any, {
              onSuccess: () => router.push("/adjustment"),
            })
          }
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
