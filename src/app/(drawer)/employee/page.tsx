"use client";

import React from "react";
import {
  IEmployee,
  useCreateEmployee,
  useDeactivateEmployee,
  useGetEmployeesInfinite,
  useResetPassword,
  useUpdateEmployee,
} from "@/api/employee/api.employee";
import { useFetchRoleSelector } from "@/api/role/api.role";
import { LoadingView, ErrorView } from "@/components/common/StateView";
import { AccessDeniedView } from "@/components/guards/AccessDeniedView";
import { usePermissions } from "@/hooks/permission.hook";
import { Button } from "@/components/ui/button";
import {
  Plus,
  MoreHorizontal,
  User,
  Pencil,
  KeyRound,
  UserX,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import EmployeeForm from "@/components/forms/employee/EmployeeForm";
import EmployeeResetPasswordForm from "@/components/forms/employee/EmployeeResetPasswordForm";
import {
  CreateEmployeeFormValues,
  ResetPasswordFormValues,
  UpdateEmployeeFormValues,
} from "@/components/forms/employee/employee.schema";

export default function EmployeePage() {
  const { canView, canCreate, canUpdate, canDelete } = usePermissions();
  const hasViewAccess = canView("EMPLOYEES");
  const hasCreateAccess = canCreate("EMPLOYEES");
  const hasUpdateAccess = canUpdate("EMPLOYEES");
  const hasDeleteAccess = canDelete("EMPLOYEES");
  const [search] = React.useState("");
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<IEmployee | null>(null);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = React.useState(false);
  const [employeeFormMode, setEmployeeFormMode] = React.useState<
    "add" | "edit"
  >("add");
  const [isResetPasswordOpen, setIsResetPasswordOpen] = React.useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = React.useState(false);

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(selectedEmployee?.id ?? "");
  const resetPassword = useResetPassword();
  const deactivateEmployee = useDeactivateEmployee();
  const roleSelector = useFetchRoleSelector();
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetEmployeesInfinite({ search }, hasViewAccess);

  const employees = React.useMemo(() => {
    return data?.pages?.flatMap((page) => page.data as IEmployee[]) ?? [];
  }, [data]);

  const roleOptions = React.useMemo(() => {
    if (!Array.isArray(roleSelector.data)) return [];
    return roleSelector.data.map((role: any) => ({
      label: role.name,
      value: role.id,
    }));
  }, [roleSelector.data]);

  const handleSaveEmployee = (
    values: CreateEmployeeFormValues | UpdateEmployeeFormValues,
  ) => {
    if (employeeFormMode === "add") {
      createEmployee.mutate(values as CreateEmployeeFormValues, {
        onSuccess: () => setIsEmployeeFormOpen(false),
      });
      return;
    }

    if (selectedEmployee?.id) {
      updateEmployee.mutate(values as UpdateEmployeeFormValues, {
        onSuccess: () => {
          setIsEmployeeFormOpen(false);
          setSelectedEmployee(null);
        },
      });
    }
  };

  const handleResetPassword = (values: ResetPasswordFormValues) => {
    if (!selectedEmployee?.id) return;
    resetPassword.mutate(
      { id: selectedEmployee.id, password: values.password },
      {
        onSuccess: () => {
          setIsResetPasswordOpen(false);
          setSelectedEmployee(null);
        },
      },
    );
  };

  const handleDeactivateEmployee = () => {
    if (!selectedEmployee?.id) return;
    deactivateEmployee.mutate(
      { id: selectedEmployee.id },
      {
        onSuccess: () => {
          setIsDeactivateOpen(false);
          setSelectedEmployee(null);
        },
      },
    );
  };

  const ActionsDropdown = ({ emp }: { emp: IEmployee }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full bg-secondary">
        {hasUpdateAccess && (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              setEmployeeFormMode("edit");
              setSelectedEmployee(emp);
              setIsEmployeeFormOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit employee
          </DropdownMenuItem>
        )}
        {hasUpdateAccess && (
          <DropdownMenuItem
            onClick={() => {
              setSelectedEmployee(emp);
              setIsResetPasswordOpen(true);
            }}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Reset password
          </DropdownMenuItem>
        )}
        {hasDeleteAccess && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              setSelectedEmployee(emp);
              setIsDeactivateOpen(true);
            }}
          >
            <UserX className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!hasViewAccess) {
    return <AccessDeniedView moduleName="Employees" />;
  }

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView refetch={refetch} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team, roles, and access permissions.
          </p>
        </div>
        {hasCreateAccess && (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEmployeeFormMode("add");
              setSelectedEmployee(null);
              setIsEmployeeFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {emp.name?.substring(0, 2).toUpperCase() || "EM"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{emp.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {emp.role?.name || "Member"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActionsDropdown emp={emp} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {employees.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
            No employees found.
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {emp.name?.substring(0, 2).toUpperCase() || "EM"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold leading-tight">
                    {emp.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {emp.phoneNumber || "No phone"}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="mt-1 w-fit text-xs">
                {emp.role?.name || "Member"}
              </Badge>
              <ActionsDropdown emp={emp} />
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center w-full">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading more..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Add / Edit Employee Dialog */}
      <Dialog open={isEmployeeFormOpen} onOpenChange={setIsEmployeeFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {employeeFormMode === "add" ? "Add employee" : "Edit employee"}
            </DialogTitle>
          </DialogHeader>
          {roleSelector.isLoading ? (
            <LoadingView />
          ) : roleSelector.isError ? (
            <ErrorView refetch={roleSelector.refetch} />
          ) : (
            <EmployeeForm
              mode={employeeFormMode}
              initialData={selectedEmployee}
              roleOptions={roleOptions}
              onSubmit={handleSaveEmployee}
              onCancel={() => {
                setIsEmployeeFormOpen(false);
                setSelectedEmployee(null);
              }}
              isPending={createEmployee.isPending || updateEmployee.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset employee password</DialogTitle>
          </DialogHeader>
          <EmployeeResetPasswordForm
            onSubmit={handleResetPassword}
            onCancel={() => {
              setIsResetPasswordOpen(false);
              setSelectedEmployee(null);
            }}
            isPending={resetPassword.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Deactivate Alert Dialog */}
      <AlertDialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This employee will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeactivateEmployee}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
