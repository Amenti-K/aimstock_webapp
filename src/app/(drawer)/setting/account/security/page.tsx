"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/language.hook";
import { Shield, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePassword } from "@/api/setting/api.user";
import TextField from "@/components/forms/fields/TextField";
import { useAuthLock } from "@/context/AuthLockContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const pinSchema = z
  .object({
    pin: z
      .string()
      .length(6, "PIN must be 6 digits")
      .regex(/^\d+$/, "PIN must be numeric"),
    confirmPin: z.string().length(6, "PIN must be 6 digits"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs don't match",
    path: ["confirmPin"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;
type PinFormValues = z.infer<typeof pinSchema>;

export default function SecurityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const changePassword = useChangePassword();
  const { t } = useLanguage();
  const {
    hasPin,
    isLockEnabled,
    toggleLockEnabled,
    setNewPin,
    clearPin,
    lockSession,
  } = useAuthLock();

  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const pinForm = useForm<PinFormValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const onChangePassword = (data: PasswordFormValues) => {
    changePassword.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast({
            title: t("common:success"),
            description: t("setting.security.changePass.success"),
          });
          reset();
        },
      },
    );
  };

  const onPinSubmit = async (data: PinFormValues) => {
    await setNewPin(data.pin);
    toast({
      title: t("setting.security.2fa.pinSetMessage"),
      description: t("setting.security.2fa.2faEnabled"),
    });
    setIsPinDialogOpen(false);
    pinForm.reset();
  };

  const handleToggleLock = (checked: boolean) => {
    if (checked) {
      if (!hasPin) {
        setIsPinDialogOpen(true);
      } else {
        toggleLockEnabled(true);
      }
    } else {
      toggleLockEnabled(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("setting.security.title")}
        </h1>
      </div>

      {/* Session Lock Section */}
      <div className="flex items-center justify-between rounded-lg border p-4 bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-full text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {t("setting.security.sessionLock")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("setting.security.sessionLockDesc")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasPin && isLockEnabled && (
            <Button variant="outline" size="sm" onClick={lockSession}>
              {t("setting.security.lockNow")}
            </Button>
          )}
          <Switch checked={isLockEnabled} onCheckedChange={handleToggleLock} />
        </div>
      </div>

      {hasPin && isLockEnabled && (
        <div className="flex gap-2">
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0"
            onClick={() => setIsPinDialogOpen(true)}
          >
            {t("setting.security.changePin")}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="link"
            size="sm"
            className="text-xs h-auto p-0 text-destructive"
            onClick={() => {
              if (confirm(t("setting.security.confirmDisablePin"))) clearPin();
            }}
          >
            {t("setting.security.clearDisable")}
          </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("setting.security.title")}
          </CardTitle>
          <CardDescription>
            {t("setting.security.changePass.passwordDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("setting.security.changePass.currentPass")}</Label>
            <TextField
              control={control as any}
              name="currentPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("setting.security.changePass.newPass")}</Label>
            <TextField
              control={control as any}
              name="newPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("setting.security.changePass.confirmPass")}</Label>
            <TextField
              control={control as any}
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit(onChangePassword)}
            disabled={changePassword.isPending}
          >
            {changePassword.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("setting.security.changePass.updateSecurity")}
          </Button>
        </CardContent>
      </Card>

      {/* PIN Setup Dialog */}
      <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("setting.security.setPinTitle")}</DialogTitle>
            <DialogDescription>
              {t("setting.security.setPinDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("setting.pin.enterNew")}</Label>
              <TextField
                control={pinForm.control as any}
                name="pin"
                type="password"
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("setting.pin.confirmNew")}</Label>
              <TextField
                control={pinForm.control as any}
                name="confirmPin"
                type="password"
                placeholder="••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPinDialogOpen(false)}>
              {t("common:cancel")}
            </Button>
            <Button onClick={pinForm.handleSubmit(onPinSubmit)}>
              {t("setting.security.saveEnable")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
