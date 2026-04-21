"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@/components/forms/fields/TextField";
import SelectField from "@/components/forms/fields/SelectField";
import { Button } from "@/components/ui/button";
import { IEmployee } from "@/api/employee/api.employee";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  CreateEmployeeFormValues,
  UpdateEmployeeFormValues,
} from "./employee.schema";

interface Option {
  label: string;
  value: string;
}

interface EmployeeFormProps {
  mode: "add" | "edit";
  roleOptions: Option[];
  initialData?: IEmployee | null;
  onSubmit: (values: CreateEmployeeFormValues | UpdateEmployeeFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function EmployeeForm({
  mode,
  roleOptions,
  initialData,
  onSubmit,
  onCancel,
  isPending = false,
}: EmployeeFormProps) {
  const schema = mode === "add" ? createEmployeeSchema : updateEmployeeSchema;
  const form = useForm<CreateEmployeeFormValues | UpdateEmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "add"
        ? { name: "", phoneNumber: "", password: "", roleId: "" }
        : {
            name: initialData?.name ?? "",
            phoneNumber: initialData?.phoneNumber ?? "",
            roleId: initialData?.role?.id ?? initialData?.roleId ?? "",
          },
  });

  React.useEffect(() => {
    if (mode === "edit") {
      form.reset({
        name: initialData?.name ?? "",
        phoneNumber: initialData?.phoneNumber ?? "",
        roleId: initialData?.role?.id ?? initialData?.roleId ?? "",
      });
    }
  }, [form, initialData, mode]);

  return (
    <form onSubmit={form.handleSubmit((values) => onSubmit(values))} className="space-y-4">
      <TextField
        name="name"
        control={form.control}
        label="Full name"
        placeholder="John Doe"
      />
      <TextField
        name="phoneNumber"
        control={form.control}
        label="Phone number"
        placeholder="0912345678"
      />
      <SelectField
        name="roleId"
        control={form.control}
        label="Role"
        placeholder="Select role"
        options={roleOptions}
      />
      {mode === "add" && (
        <TextField
          name="password"
          control={form.control}
          secureTextEntry
          label="Password"
          placeholder="********"
        />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : mode === "add"
              ? "Create employee"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
