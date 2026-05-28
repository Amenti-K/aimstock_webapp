"use client";

import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/language.hook";
import { cn } from "@/lib/utils";

interface InstallAppButtonProps {
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showText?: boolean;
}

export default function InstallAppButton({
  className,
  variant = "outline",
  size = "sm",
  showIcon = true,
  showText = true,
}: InstallAppButtonProps) {
  const { t } = useLanguage();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setCanInstall(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setCanInstall(false);
      }
    } catch (error) {
      console.error("Install failed", error);
    }
  };

  if (!canInstall) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstallClick}
      className={cn(
        "gap-2 font-medium border-primary/20 hover:bg-primary/5 transition-all duration-300 transform active:scale-95",
        className,
      )}
    >
      {showIcon && <Download className="h-4 w-4 text-primary" />}
      {showText && <span>{t("auth.register.installAppShort")}</span>}
    </Button>
  );
}
