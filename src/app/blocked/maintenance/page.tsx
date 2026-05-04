"use client";

import React from "react";
import { Wrench } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";

export default function MaintenancePage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-10 h-10 text-orange-600" />
      </div>
      
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        {t("guard.maintenance.title")}
      </h1>
      
      <p className="text-muted-foreground max-w-sm mb-2">
        {t("guard.maintenance.subtitle")}
      </p>
      <p className="text-sm text-muted-foreground">
        {t("guard.maintenance.message")}
      </p>
    </div>
  );
}
