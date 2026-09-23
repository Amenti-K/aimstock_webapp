"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit3, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryForm from "@/components/forms/inventory/InventoryForm";
import {
  useDiscontinueInventory,
  useFetchInventory,
  useUpdateInventory,
} from "@/api/inventory/api.inventory";
import { usePermissions } from "@/hooks/permission.hook";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import type { inventoryFormValues } from "@/components/schema/inventory.schema";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EditInventoryPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const inventoryId = id as string;
  const { canUpdate } = usePermissions();
  const hasUpdateAccess = canUpdate("INVENTORY");
  const updateInventory = useUpdateInventory(inventoryId);
  const discontinueInventory = useDiscontinueInventory(inventoryId);
  const { data, isLoading, isError, refetch } = useFetchInventory(
    inventoryId,
    hasUpdateAccess,
  );

  const [isDiscontinueOpen, setIsDiscontinueOpen] = React.useState(false);

  if (!hasUpdateAccess) {
    return <AccessDeniedView moduleName={t("inventory.moduleName")} />;
  }
  if (isLoading) return <LoadingView />;
  if (isError || !data?.data) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between px-1">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 border-none bg-card shadow-sm hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <h1 className="text-xl md:text-2xl font-black tracking-tight">
                {t("inventory.form.edit")}
              </h1>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              {data.data.name}
            </p>
          </div>
        </div>
      </div>

      <InventoryForm
        isEdit
        initialData={data.data}
        isLoading={updateInventory.isPending}
        onSubmit={(payload: inventoryFormValues) =>
          updateInventory.mutate(payload, {
            onSuccess: () => router.push(`/inventory/${inventoryId}`),
          })
        }
        onDiscontinue={() => setIsDiscontinueOpen(true)}
        isDiscontinuePending={discontinueInventory.isPending}
      />

      {/* Discontinue Confirmation Dialog */}
      <AlertDialog open={isDiscontinueOpen} onOpenChange={setIsDiscontinueOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Ban className="h-5 w-5 text-orange-500" />
              </div>
              <AlertDialogTitle className="text-lg font-black">
                {t("inventory.discontinue.confirmTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-relaxed">
              {t("inventory.discontinue.confirmMessage", {
                name: data.data.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-orange-500 text-white hover:bg-orange-600 rounded-full"
              onClick={() =>
                discontinueInventory.mutate(undefined as any, {
                  onSuccess: () => router.push(`/inventory/${inventoryId}`),
                })
              }
            >
              {t("inventory.discontinue.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
