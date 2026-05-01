"use client";

import React from "react";
import {
  useCreateRole,
  useDeleteRole,
  useFetchRoleById,
  useGetRolesInfinite,
  useUpdateRole,
} from "@/api/role/api.role";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck, Pencil, Copy, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import RoleForm from "@/components/forms/role/RoleForm";
import { RoleFormValues } from "@/components/forms/role/role.schema";
import { IRole } from "@/components/interface/role/role.interface";
import { useLanguage } from "@/hooks/language.hook";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RolePage() {
  const { t } = useLanguage();
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("ROLE");
  const hasCreateAccess = canCreate("ROLE");
  const hasUpdateAccess = canUpdate("ROLE");
  const hasDeleteAccess = canDelete("ROLE");
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(
    null,
  );
  const [formMode, setFormMode] = React.useState<
    "create" | "edit" | "duplicate"
  >("create");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetRolesInfinite({}, hasViewAccess);

  const selectedRoleQuery = useFetchRoleById(
    selectedRoleId ?? "",
    !!selectedRoleId,
  );
  const updateRole = useUpdateRole(selectedRoleId ?? "");

  const roles = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page.data as IRole[]) ?? [];
  }, [data]);

  const selectedRole = selectedRoleQuery.data ?? null;
  const formInitialData =
    formMode === "duplicate" && selectedRole
      ? {
          ...selectedRole,
          id: "",
          name: `${selectedRole.name} (Copy)`,
        }
      : selectedRole;

  const onOpenCreate = () => {
    setSelectedRoleId(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const onOpenEdit = (roleId: string) => {
    setSelectedRoleId(roleId);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const onOpenDuplicate = (roleId: string) => {
    setSelectedRoleId(roleId);
    setFormMode("duplicate");
    setIsFormOpen(true);
  };

  const onCreateOrUpdate = (values: RoleFormValues) => {
    const payload = {
      ...values,
      permissions: values.permissions.filter((permission) => {
        const hasAll = values.permissions.some(
          (candidate) =>
            candidate.module === permission.module &&
            candidate.permission === "ALL",
        );
        return hasAll ? permission.permission === "ALL" : true;
      }),
    };

    if (formMode === "create" || formMode === "duplicate") {
      createRole.mutate(payload as any, {
        onSuccess: () => {
          setIsFormOpen(false);
          setSelectedRoleId(null);
        },
      });
      return;
    }

    if (selectedRoleId) {
      updateRole.mutate(payload as any, {
        onSuccess: () => {
          setIsFormOpen(false);
          setSelectedRoleId(null);
        },
      });
    }
  };

  const handleDeleteRole = () => {
    if (!selectedRoleId) return;
    deleteRole.mutate(
      { id: selectedRoleId },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedRoleId(null);
        },
      },
    );
  };

  const GroupedPermissions = ({ permissions }: { permissions: any[] }) => {
    const grouped = permissions.reduce((acc: any, p: any) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p.permission);
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {Object.entries(grouped).map(([module, perms]: [string, any]) => (
          <div key={module} className="space-y-1.5">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              {module}
            </span>
            <div className="flex flex-wrap gap-1">
              {perms.map((p: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const RoleActions = ({ role }: { role: IRole }) => (
    <div className="flex items-center gap-2 mt-6 border-t pt-4">
      {hasUpdateAccess && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onOpenEdit(role.id);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
          {t("common.edit")}
        </Button>
      )}
      {hasCreateAccess && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDuplicate(role.id);
          }}
        >
          <Copy className="h-3.5 w-3.5" />
          {t("role.card.duplicate")}
        </Button>
      )}
      {hasDeleteAccess && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRoleId(role.id);
            setIsDeleteOpen(true);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("common.delete")}
        </Button>
      )}
    </div>
  );

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName={t("role.moduleName")} />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  const RoleContent = ({ role }: { role: IRole }) => (
    <div className="space-y-4">
      {role.description && (
        <div className="text-sm text-muted-foreground leading-relaxed">
          {role.description}
        </div>
      )}
      <GroupedPermissions permissions={role.permissions} />
      <RoleActions role={role} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("role.moduleName")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("role.roleDes")}</p>
        </div>
        {hasCreateAccess && (
          <Button className="hidden sm:flex" onClick={onOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> {t("role.form.addRole")}
          </Button>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      {hasCreateAccess && (
        <div className="fixed bottom-20 right-6 z-50 sm:hidden">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90"
            onClick={onOpenCreate}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Roles List */}
      <div className="grid gap-4">
        {roles.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {t("role.emptyRole")}
          </Card>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={roles.map((r) => r.id)}
            className="space-y-4"
          >
            {roles.map((role) => (
              <div key={role.id}>
                {/* Desktop View: Expanded Card */}
                <Card className="hidden md:block overflow-hidden transition-all hover:shadow-md border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RoleContent role={role} />
                  </CardContent>
                </Card>

                {/* Mobile View: Accordion */}
                <AccordionItem
                  value={role.id}
                  className="md:hidden border rounded-xl bg-card px-4 shadow-sm"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-base leading-tight">
                          {role.name}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {role.permissions?.length || 0}{" "}
                          {t("role.form.module")}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <RoleContent role={role} />
                  </AccordionContent>
                </AccordionItem>
              </div>
            ))}
          </Accordion>
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center w-full pb-20 sm:pb-0">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
          </Button>
        </div>
      )}

      {/* Create / Edit / Duplicate Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedRoleId(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? t("role.form.addRole")
                : formMode === "duplicate"
                  ? t("role.form.duplicateRole")
                  : t("role.form.editRole")}
            </DialogTitle>
          </DialogHeader>
          {formMode !== "create" &&
          selectedRoleId &&
          selectedRoleQuery.isLoading ? (
            <LoadingView />
          ) : formMode !== "create" &&
            selectedRoleId &&
            selectedRoleQuery.isError ? (
            <ErrorView refetch={selectedRoleQuery.refetch} />
          ) : (
            <RoleForm
              initialData={formInitialData}
              onSubmit={onCreateOrUpdate}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedRoleId(null);
              }}
              isPending={createRole.isPending || updateRole.isPending}
              submitLabel={
                formMode === "edit"
                  ? t("common.saveChanges")
                  : t("role.form.createRole")
              }
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.confirmDelete.title", {
                entity: t("role.moduleName"),
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.confirmDelete.message", {
                entity: t("role.moduleName"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteRole}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
