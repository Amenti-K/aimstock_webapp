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
        "inline-flex items-center gap-2.5 p-1.5 px-3 rounded-full border border-border/40 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 group",
        className
      )}
    >
      <Avatar className="h-5 w-5 border border-border/50">
        <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-foreground/80 leading-none">
          {lastAudit.user?.name || t("common.unknown_user", "Unknown")}
        </span>
        
        <div className="h-3 w-[1px] bg-border/40" />

        <div className="flex items-center gap-1.5">
          <Badge 
            variant="outline" 
            className={cn(
              "h-3.5 px-1.5 text-[8px] font-bold uppercase tracking-wider border-0", 
              getActionStyles(lastAudit.action)
            )}
          >
            {getActionLabel(lastAudit.action)}
          </Badge>
          
          <span className="text-[9px] text-muted-foreground/60 flex items-center gap-1">
            <History className="h-2.5 w-2.5" />
            {formatDistanceToNow(new Date(lastAudit.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LastAudit;
