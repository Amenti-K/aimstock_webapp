"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SalesForm from "@/components/sales/SalesForm";
import { useCreateSale } from "@/api/sale/api.sale";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";

export default function NewSalesPage() {
  const router = useRouter();
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
          <h1 className="text-2xl font-bold tracking-tight">Add Sale</h1>
          <p className="text-sm text-muted-foreground">
            Record a new sales transaction.
          </p>
        </div>
      </div>

      <SalesForm
        isLoading={createSale.isPending}
        onSubmit={(payload) =>
          createSale.mutate(payload, {
            onSuccess: () => router.push("/app/sales"),
          })
        }
      />
    </div>
  );
}
