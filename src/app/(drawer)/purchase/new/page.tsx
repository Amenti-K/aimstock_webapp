"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PurchaseForm from "@/components/purchase/PurchaseForm";
import { useCreatePurchase } from "@/api/purchase/api.purchase";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";

export default function NewPurchasePage() {
  const router = useRouter();
  const { canCreate } = usePermissions();
  const hasCreateAccess = canCreate("PURCHASE");
  const createPurchase = useCreatePurchase();

  if (!hasCreateAccess) {
    return <AccessDeniedView moduleName="Purchase" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Purchase</h1>
          <p className="text-sm text-muted-foreground">
            Record a new supplier purchase.
          </p>
        </div>
      </div>

      <PurchaseForm
        isLoading={createPurchase.isPending}
        onSubmit={(payload) =>
          createPurchase.mutate(payload, {
            onSuccess: () => router.push("/purchase"),
          })
        }
      />
    </div>
  );
}
