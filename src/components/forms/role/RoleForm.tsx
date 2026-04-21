"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/components/forms/fields/TextField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  moduleEnum,
  permissionEnum,
  roleFormSchema,
  RoleFormValues,
  ModuleType,
  PermissionType,
} from "./role.schema";
import { IRole } from "@/api/role/api.role";

const COLUMNS: PermissionType[] = permissionEnum.options;
const MODULES: ModuleType[] = moduleEnum.options;

interface RoleFormProps {
  initialData?: IRole | null;
  onSubmit: (values: RoleFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
  submitLabel: string;
}

const buildRoleValues = (initialData?: IRole | null): RoleFormValues => ({
  name: initialData?.name ?? "",
  permissions: (initialData?.permissions ?? []).map((perm: any) => ({
    module: perm.module,
    permission: perm.permission,
  })),
});

export default function RoleForm({
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
  submitLabel,
}: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: buildRoleValues(initialData),
  });

  React.useEffect(() => {
    form.reset(buildRoleValues(initialData));
  }, [form, initialData]);

  const watchedPermissions = form.watch("permissions") ?? [];

  const setPermissions = (value: RoleFormValues["permissions"]) => {
    form.setValue("permissions", value, { shouldDirty: true, shouldValidate: true });
  };

  const modulePermissions = (module: ModuleType) =>
    watchedPermissions
      .filter((permission) => permission.module === module)
      .map((permission) => permission.permission);

  const togglePermission = (module: ModuleType, permission: PermissionType) => {
    const current = modulePermissions(module);
    const isAllChecked = current.includes("ALL");
    const withoutModule = watchedPermissions.filter((perm) => perm.module !== module);

    if (permission === "ALL") {
      if (isAllChecked) {
        setPermissions(withoutModule);
      } else {
        setPermissions([...withoutModule, { module, permission: "ALL" }]);
      }
      return;
    }

    if (isAllChecked) {
      const explicit = COLUMNS.filter(
        (column) => column !== "ALL" && column !== permission,
      ).map((column) => ({ module, permission: column }));
      setPermissions([...withoutModule, ...explicit]);
      return;
    }

    const alreadyChecked = current.includes(permission);
    if (alreadyChecked) {
      setPermissions(
        watchedPermissions.filter(
          (perm) => !(perm.module === module && perm.permission === permission),
        ),
      );
      return;
    }

    const specificColumns = COLUMNS.filter((column) => column !== "ALL");
    const currentSpecific = current.filter((column) => column !== "ALL");
    const willHaveAll = specificColumns.every(
      (column) => column === permission || currentSpecific.includes(column),
    );

    if (willHaveAll) {
      setPermissions([...withoutModule, { module, permission: "ALL" }]);
      return;
    }

    setPermissions([...watchedPermissions, { module, permission }]);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <TextField
        name="name"
        control={form.control}
        label="Role name"
        placeholder="e.g. Sales Manager"
      />

      <div className="rounded-md border">
        <div className="grid grid-cols-[minmax(180px,1.5fr)_repeat(5,minmax(90px,1fr))] bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Module</div>
          {COLUMNS.map((column) => (
            <div key={column} className="text-center">
              {column}
            </div>
          ))}
        </div>

        {MODULES.map((module) => {
          const modulePerms = modulePermissions(module);
          const isAllChecked = modulePerms.includes("ALL");

          return (
            <div
              key={module}
              className="grid grid-cols-[minmax(180px,1.5fr)_repeat(5,minmax(90px,1fr))] items-center border-t px-3 py-2 text-sm"
            >
              <div className="font-medium">{module}</div>
              {COLUMNS.map((column) => {
                const checked = isAllChecked || modulePerms.includes(column);
                return (
                  <div key={column} className="flex justify-center">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePermission(module, column)}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {form.formState.errors.permissions && (
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors.permissions.message}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
