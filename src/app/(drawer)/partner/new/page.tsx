"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreatePartner } from "@/api/partner/api.partner";
import PartnerForm from "@/components/forms/partner/PartnerForm";
import { PartnerFormValues } from "@/components/forms/partner/partner.schema";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";

export default function NewPartnerPage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const createPartner = useCreatePartner();
  if (!canCreate("PARTNERS")) return <AccessDeniedView moduleName="Partners" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h1 className="text-2xl font-bold tracking-tight">Add Partner</h1><p className="text-sm text-muted-foreground">Create a partner profile.</p></div>
      </div>
      <PartnerForm
        isPending={createPartner.isPending}
        submitLabel="Create partner"
        onSubmit={(values: PartnerFormValues) => createPartner.mutate(values as any, { onSuccess: () => router.push("/app/partner") })}
        onCancel={() => router.back()}
      />
    </div>
  );
}
