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
import {
  Plus,
  Search,
  MoreHorizontal,
  ShieldCheck,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

export default function RolePage() {
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("ROLE");
  const hasCreateAccess = canCreate("ROLE");
  const hasUpdateAccess = canUpdate("ROLE");
  const hasDeleteAccess = canDelete("ROLE");
  const [search, setSearch] = React.useState("");
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
  } = useGetRolesInfinite({ search }, hasViewAccess);

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

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Roles & Permissions" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure access levels for your team members.
          </p>
        </div>
        {hasCreateAccess && (
          <Button className="w-full sm:w-auto" onClick={onOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground">
                    {role.description || "No description provided."}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions
                        ?.slice(0, 3)
                        .map((p: any, idx: number) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {p.module}:{p.permission}
                          </Badge>
                        ))}
                      {(role.permissions?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{(role.permissions?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {hasUpdateAccess && (
                          <DropdownMenuItem onClick={() => onOpenEdit(role.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit role
                          </DropdownMenuItem>
                        )}
                        {hasCreateAccess && (
                          <DropdownMenuItem
                            onClick={() => onOpenDuplicate(role.id)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate role
                          </DropdownMenuItem>
                        )}
                        {hasDeleteAccess && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRoleId(role.id);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete role
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                ? "Create role"
                : formMode === "duplicate"
                  ? "Duplicate role"
                  : "Edit role"}
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
              submitLabel={formMode === "edit" ? "Save changes" : "Create role"}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected role will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteRole}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
