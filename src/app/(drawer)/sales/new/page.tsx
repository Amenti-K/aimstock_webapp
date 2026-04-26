"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesForm from "@/components/forms/sales/SalesForm";
import { useCreateSale } from "@/api/sale/api.sale";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { useLanguage } from "@/hooks/language.hook";

export default function NewSalesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { canCreate } = usePermissions();
  const hasCreateAccess = canCreate("SALES");
  const createSale = useCreateSale();

  if (!hasCreateAccess) {
    return <AccessDeniedView moduleName="Sales" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("sales.form.addSale")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("sales.description")}
          </p>
        </div>
      </div>

      <SalesForm
        isLoading={createSale.isPending}
        onSubmit={(payload) =>
          createSale.mutate(payload, {
            onSuccess: () => router.push("/sales"),
          })
        }
      />
    </div>
  );
}
