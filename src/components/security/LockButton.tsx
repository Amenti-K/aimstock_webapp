"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useAuthLock } from "@/context/AuthLockContext";
import { cn } from "@/lib/utils";

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

  if (!isLockEnabled || !hasPin) return null;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={lockSession}
      title="Lock Session"
    >
      <Lock className="h-4 w-4" />
      {showLabel && <span>Lock Session</span>}
    </Button>
  );
}
