"use client";

import React from "react";
import { useGetAuditLogsInfinite } from "@/api/audit/api.audit";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Search, History, User } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import SelectField from "@/components/forms/fields/SelectField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AuditAction,
  EntityType,
} from "@/components/interface/auditLog/interface.audit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const filterSchema = z.object({
  auditAction: z.string().optional(),
  entityType: z.string().optional(),
});

type FilterForm = z.infer<typeof filterSchema>;

export default function AuditPage() {
  const { canView } = usePermissions();
  const hasViewAccess = canView("AUDITLOG");
  const [search, setSearch] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const { control, watch } = useForm<FilterForm>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      auditAction: "",
      entityType: "",
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
      search,
      auditAction: selectedAction || undefined,
      entityType: selectedEntityType || undefined,
    },
    hasViewAccess,
  );

  const actionOptions = React.useMemo(
    () => [
      { label: "All actions", value: "ALL" as AuditAction },
      ...Object.values(AuditAction).map((action) => ({
        label: action,
        value: action,
      })),
    ],
    [],
  );
  const entityOptions = React.useMemo(
    () => [
      { label: "All entities", value: "All" as EntityType },
      ...Object.values(EntityType).map((entity) => ({
        label: entity,
        value: entity,
      })),
    ],
    [],
  );

  const logs = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page.data) ?? [];
  }, [data]);

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Audit Logs" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-500/10 text-green-600";
    if (action.includes("UPDATE")) return "bg-blue-500/10 text-blue-600";
    if (action.includes("DELETE")) return "bg-red-500/10 text-red-600";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Track system activities and user actions for accountability.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SelectField
          name="entityType"
          control={control}
          label="Entity type"
          options={entityOptions}
        />
        <SelectField
          name="auditAction"
          control={control}
          label="Action"
          options={actionOptions}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: any) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedLog(log);
                    setIsDetailsOpen(true);
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
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-semibold">
                    {log.entityType}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                    {JSON.stringify(log.newValues || log.oldValues || {})}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {hasNextPage && (
          <div className="flex justify-center p-4">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading more..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Audit log details</DialogTitle>
          </DialogHeader>
          {!selectedLog ? null : (
            <div className="space-y-4 text-sm">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Action</p>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedLog.entityType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entity ID</p>
                  <p className="font-mono text-xs">{selectedLog.entityId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Old values
                </p>
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(selectedLog.oldValues ?? {}, null, 2)}
                </pre>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  New values
                </p>
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(selectedLog.newValues ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
