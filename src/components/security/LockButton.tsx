"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useAuthLock } from "@/context/AuthLockContext";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/language.hook";

interface LockButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function LockButton({
  className,
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: LockButtonProps) {
  const { lockSession, isLockEnabled, hasPin } = useAuthLock();
  const { t } = useLanguage();

  if (!isLockEnabled || !hasPin) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={lockSession}
      title={t("setting.security.lockNow")}
    >
      <Lock className="h-4 w-4" />
      {showLabel && <span>{t("setting.security.lockNow")}</span>}
    </Button>
  );
}
