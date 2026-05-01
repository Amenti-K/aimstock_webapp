"use client";

import React from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useGetEntityLogs } from "@/api/audit/api.audit";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { ChevronLeft, Info, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GenericEntityViewer from "@/components/auditLog/GenericEntityViewer";
import AuditLogTimelineItem from "@/components/auditLog/AuditLogTimelineItem";
import { useLanguage } from "@/hooks/language.hook";

export default function AuditDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const id = params.id as string;
  const entityType = searchParams.get("entityType") || "";

  const { canView } = usePermissions();
  const hasViewAccess = canView("AUDITLOG");

  const { data, isLoading, isError, refetch } = useGetEntityLogs(
    id,
    entityType,
    hasViewAccess
  );

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("audit.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const logs = data?.data?.logs || [];
  const entity = data?.data?.entity;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("audit.detailTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("audit.detailDescription", { 
              entityType: t(`audit.entities.${entityType.toLowerCase()}`).toLowerCase() 
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-none bg-card/50 backdrop-blur">
            <CardHeader className="pb-3 flex flex-row items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">{t("audit.entityDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericEntityViewer data={entity} label={t(`audit.entities.${entityType.toLowerCase()}`)} />
              
              <div className="mt-6 pt-4 border-t border-muted-foreground/10">
                <p className="text-[10px] text-muted-foreground font-mono text-right">
                  UID: {id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action History / Timeline */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2 px-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("audit.actionHistory")}</h2>
          </div>
          
          <div className="space-y-1">
            {logs.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {t("audit.noHistory")}
              </Card>
            ) : (
              logs.map((log, index) => (
                <AuditLogTimelineItem 
                  key={log.id} 
                  item={log} 
                  isLast={index === logs.length - 1} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
