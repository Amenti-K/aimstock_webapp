"use client";

import React from "react";
import { useGetAuditLogsInfinite } from "@/api/audit/api.audit";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { History, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatter";
import SelectField from "@/components/forms/fields/SelectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AuditAction,
  EntityType,
} from "@/components/interface/auditLog/interface.audit";
import { useRouter } from "next/navigation";
import { InfiniteScrollTrigger } from "@/components/common/InfiniteScrollTrigger";
import { useLanguage } from "@/hooks/language.hook";

const filterSchema = z.object({
  auditAction: z.string().optional(),
  entityType: z.string().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

export default function AuditPage() {
  const { canView } = usePermissions();
  const { t } = useLanguage();
  const hasViewAccess = canView("AUDITLOG");
  const router = useRouter();

  const { control, watch } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      auditAction: "ALL",
      entityType: "ALL",
    },
  });
  const selectedAction = watch("auditAction");
  const selectedEntityType = watch("entityType");

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAuditLogsInfinite(
    {
      auditAction:
        selectedAction && selectedAction !== "ALL" ? selectedAction : undefined,
      entityType:
        selectedEntityType && selectedEntityType !== "ALL"
          ? selectedEntityType
          : undefined,
    },
    hasViewAccess,
  );

  const actionOptions = React.useMemo(
    () => [
      { label: t("audit.allActions"), value: "ALL" as AuditAction },
      ...Object.values(AuditAction).map((action) => ({
        label: t(`audit.action.${action.toLowerCase()}`),
        value: action,
      })),
    ],
    [t],
  );

  const entityOptions = React.useMemo(
    () => [
      { label: t("audit.allEntities"), value: "ALL" as EntityType },
      ...Object.values(EntityType).map((entity) => ({
        label: t(`audit.entities.${entity.toLowerCase()}`),
        value: entity,
      })),
    ],
    [t],
  );

  const logs = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page.data) ?? [];
  }, [data]);

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-500/10 text-green-600";
    if (action.includes("UPDATE")) return "bg-blue-500/10 text-blue-600";
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-600";
    return "bg-muted text-muted-foreground";
  };

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("audit.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header - Hidden on mobile */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold tracking-tight">{t("audit.moduleName")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("audit.moduleDescription")}
        </p>
      </div>

      {/* Filters — always side by side, 50/50 */}
      <div className="grid grid-cols-2 gap-4 w-full items-end">
        <SelectField
          name="entityType"
          control={control as any}
          label={t("audit.entityType")}
          options={entityOptions}
        />
        <SelectField
          name="auditAction"
          control={control as any}
          label={t("audit.actionLabel")}
          options={actionOptions}
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("audit.time")}</TableHead>
              <TableHead>{t("audit.user")}</TableHead>
              <TableHead>{t("audit.actionLabel")}</TableHead>
              <TableHead>{t("audit.entityType")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t("audit.emptyAudit")}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    router.push(`/audit/${log.entityId}?entityType=${log.entityType}`);
                  }}
                >
                  <TableCell className="font-medium whitespace-nowrap text-xs">
                    <div className="flex items-center gap-2">
                      <History className="h-3 w-3 text-muted-foreground" />
                      {formatDate(log.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span className="text-xs">
                        {log.user?.name || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${getActionColor(log.action)}`}
                    >
                      {t(`audit.action.${log.action.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {t(`audit.entities.${log.entityType.toLowerCase()}`)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {logs.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            {t("audit.emptyAudit")}
          </div>
        ) : (
          logs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start justify-between rounded-xl border bg-card p-4 shadow-sm cursor-pointer active:opacity-70"
              onClick={() => {
                router.push(`/audit/${log.entityId}?entityType=${log.entityType}`);
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <History className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-md font-semibold">
                    <User className="h-4 w-4" />
                    <span>{log.user?.name || "System"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${getActionColor(log.action)}`}
                >
                  {t(`audit.action.${log.action.toLowerCase()}`)}
                </Badge>
                <span className="text-xs font-semibold">
                  {t(`audit.entities.${log.entityType.toLowerCase()}`)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Infinite Scroll Trigger */}
      <InfiniteScrollTrigger
        hasNextPage={!!hasNextPage}
        isLoading={isFetchingNextPage}
        onIntersect={() => fetchNextPage()}
      />
    </div>
  );
}
