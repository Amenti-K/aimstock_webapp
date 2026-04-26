"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ILastAudit, AuditAction } from "@/components/interface/auditLog/interface.audit";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";

interface LastAuditProps {
  lastAudit?: ILastAudit | null;
  className?: string;
}

const LastAudit: React.FC<LastAuditProps> = ({ lastAudit, className }) => {
  const { t } = useTranslation();

  if (!lastAudit) return null;

  const getActionStyles = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:border-emerald-500/20";
      case AuditAction.UPDATE:
        return "bg-blue-500/10 text-blue-600 border-blue-200/50 dark:border-blue-500/20";
      case AuditAction.DELETE:
        return "bg-red-500/10 text-red-600 border-red-200/50 dark:border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/50 dark:border-slate-500/20";
    }
  };

  const getActionLabel = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return t("audit.created", "Created");
      case AuditAction.UPDATE:
        return t("audit.updated", "Updated");
      case AuditAction.DELETE:
        return t("audit.deleted", "Deleted");
      case AuditAction.RESTORE:
        return t("audit.restored", "Restored");
      default:
        return action;
    }
  };

  const initials = lastAudit.user?.name
    ? lastAudit.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 transition-all duration-200 group",
        // Desktop pill style
        "sm:p-1.5 sm:px-3 sm:rounded-full sm:border sm:border-border/40 sm:bg-background/50 sm:backdrop-blur-sm sm:shadow-sm sm:hover:shadow-md",
        // Mobile compact style
        "p-0 bg-transparent border-none shadow-none",
        className
      )}
    >
      <Avatar className="h-4 w-4 sm:h-5 sm:w-5 border border-border/50 shrink-0">
        <AvatarFallback className="bg-primary/5 text-primary text-[7px] sm:text-[9px] font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
        <span className="text-[9px] sm:text-[10px] font-semibold text-foreground/80 leading-none truncate max-w-[80px] sm:max-w-none">
          {lastAudit.user?.name || t("common.unknown_user", "Unknown")}
        </span>
        
        <div className="h-2.5 w-[1px] bg-border/40 hidden sm:block" />

        <div className="flex items-center gap-1 sm:gap-1.5">
          <Badge 
            variant="outline" 
            className={cn(
              "h-3 sm:h-3.5 px-1 sm:px-1.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider border-0", 
              getActionStyles(lastAudit.action)
            )}
          >
            {getActionLabel(lastAudit.action)}
          </Badge>
          
          <span className="text-[8px] sm:text-[9px] text-muted-foreground/60 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
            <History className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
            {formatDistanceToNow(new Date(lastAudit.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LastAudit;
