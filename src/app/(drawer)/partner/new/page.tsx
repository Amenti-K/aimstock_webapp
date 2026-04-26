"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCreatePartner } from "@/api/partner/api.partner";
import PartnerForm from "@/components/forms/partner/PartnerForm";
import { PartnerFormValues } from "@/components/forms/partner/partner.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function NewPartnerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canCreate } = usePermissions();
  const createPartner = useCreatePartner();
  if (!canCreate("PARTNERS"))
    return <AccessDeniedView moduleName={t("partners.moduleName")} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("partners.form.addPartner")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("partners.form.addNewPar")}
          </p>
        </div>
      </div>
      <PartnerForm
        isPending={createPartner.isPending}
        submitLabel={t("partners.form.addPartner")}
        onSubmit={(values: PartnerFormValues) =>
          createPartner.mutate(values as any, {
            onSuccess: () => router.push("/partner"),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
