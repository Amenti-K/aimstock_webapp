"use client";

import React from "react";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-10 h-10 text-orange-600" />
      </div>
      
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        System Under Maintenance
      </h1>
      
      <p className="text-muted-foreground max-w-sm mb-2">
        We are currently upgrading AIM Stock to bring you a better experience.
      </p>
      <p className="text-sm text-muted-foreground">
        Please check back in a few minutes. We apologize for the inconvenience.
      </p>
    </div>
  );
}
