"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  href: string;
  last?: boolean;
}

export const SettingItem = ({ icon, title, href, last }: SettingItemProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between p-4 transition-colors hover:bg-muted/50 active:bg-muted",
        !last && "border-b"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium">{title}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
    </Link>
  );
};

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingSection = ({ title, children }: SettingSectionProps) => {
  return (
    <div className="space-y-3">
      <h3 className="px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </h3>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {children}
      </div>
    </div>
  );
};
