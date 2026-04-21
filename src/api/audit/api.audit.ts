import { IAudit } from "@/components/interface/auditLog/interface.audit";
import { IResponse } from "@/components/interface/common.interface";
import { ILastAudit } from "@/components/interface/loan/loan.interface";
import { useFetch, useInfiniteFetch } from "@/hooks/query.hook";
import endpoints from "@/lib/endpoints";
import { queryKeys } from "@/lib/queryKeys";

export const useGetAuditLogsInfinite = (
  filterOptions?: Record<string, any>,
  enabled?: boolean,
) => {
  const { search, entityType, auditAction, ...filter } = filterOptions ?? {
    search: undefined,
  };
  const queryParams = {
    ...(filter ? { ...filter } : {}),
    ...(search ? { search } : {}),
    ...(entityType ? { entityType } : {}),
    ...(auditAction ? { auditAction } : {}),
  };

  return useInfiniteFetch<IResponse<Array<IAudit>>>(endpoints.AUDITLOG, {
    queryKey: queryKeys.auditLogs.list(queryParams),
    params: { ...queryParams, limit: 10 },
    enabled: enabled ?? true,
  });
};

export const useGetEntityLogs = (
  entityId: string | null | undefined,
  entityType: string,
  enabled?: boolean,
) => {
  return useFetch<IResponse<{ logs: IAudit[]; entity: any }>>(
    `${endpoints.AUDITLOG}/entity/${entityType}/${entityId}`,
    {
      queryKey: queryKeys.auditLogs.detail(entityId as string),
      enabled: !!(enabled ?? entityId),
    },
  );
};
