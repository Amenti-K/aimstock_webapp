"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCompany } from "@/api/setting/api.company";
import { usePermissions } from "@/hooks/permission.hook";
import TextField from "@/components/forms/fields/TextField";

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export default function CompanyProfilePage() {
  const router = useRouter();
  const { canUpdate } = usePermissions();
  const hasUpdatePermission = canUpdate("COMPANY");
  const { user, company } = useSelector((state: RootState) => state.userAuth);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || "",
    },
  });

  const updateCompany = useUpdateCompany();

  const onSave = (data: CompanyFormValues) => {
    if (!company?.id) return;

    hasUpdatePermission &&
      updateCompany.mutate(
        {
          id: company.id,
          name: data.name,
        },
        {
          onSuccess: () => {
            reset(data);
          },
        },
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Profile
          </CardTitle>
          <CardDescription>
            Organization profile and ownership-level settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <TextField
              name="name"
              control={control as any}
              disabled={!hasUpdatePermission}
            />
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-medium">
              More company settings and configurations will be available in
              future updates.
            </span>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit(onSave)}
            disabled={
              !hasUpdatePermission || updateCompany.isPending || !isDirty
            }
          >
            {updateCompany.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Save Company"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
