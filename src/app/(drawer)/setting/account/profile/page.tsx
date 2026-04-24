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
import { User, ArrowLeft, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import TextField from "@/components/forms/fields/TextField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateUserProfile } from "@/api/setting/api.user";

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phoneNumber: z.string().min(2, "Phone number is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.userAuth);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const updateProfile = useUpdateUserProfile();

  const handleSave = (data: ProfileFormValues) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        reset(data);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal identity details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <TextField
              name="name"
              control={control as any}
              type="text"
              label="Full Name"
            />
          </div>
          <div className="space-y-2">
            <TextField
              name="phoneNumber"
              control={control as any}
              disabled={user?.role.name !== "OWNER"}
            />
            {user?.role.name !== "OWNER" && (
              <p className="text-xs text-muted-foreground">
                Only owners can change phone number.
              </p>
            )}
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit(handleSave)}
            disabled={updateProfile.isPending || !isDirty}
          >
            {updateProfile.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Save Profile"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
