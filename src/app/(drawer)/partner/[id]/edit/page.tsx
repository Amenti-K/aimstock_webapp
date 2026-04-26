"use client";

import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useFetchPartnerById,
  useUpdatePartner,
} from "@/api/partner/api.partner";
import PartnerForm from "@/components/forms/partner/PartnerForm";
import { PartnerFormValues } from "@/components/forms/partner/partner.schema";
import { ErrorView, LoadingView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function EditPartnerPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const partnerId = id as string;
  const { canUpdate } = usePermissions();
  if (!canUpdate("PARTNERS"))
    return <AccessDeniedView moduleName={t("partners.moduleName")} />;

  const { data, isLoading, isError, refetch } = useFetchPartnerById(
    partnerId,
    true,
  );
  const updatePartner = useUpdatePartner(partnerId);
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
            {t("partners.form.editPartner")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("partners.detail.title")}
          </p>
        </div>
      </div>
      <PartnerForm
        initialData={data.data}
        isPending={updatePartner.isPending}
        submitLabel={t("common.update")}
        onSubmit={(values: PartnerFormValues) =>
          updatePartner.mutate(values as any, {
            onSuccess: () => router.push(`/partner/${partnerId}`),
          })
        }
        onCancel={() => router.back()}
      />
    </div>
  );
}
