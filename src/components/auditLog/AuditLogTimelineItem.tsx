"use client";

import React from "react";
import { History, PlusCircle, Pencil, MinusCircle, RefreshCcw, ArrowRight, User } from "lucide-react";
import { IAudit, AuditAction } from "@/components/interface/auditLog/interface.audit";
import { formatDate } from "@/lib/formatter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/language.hook";

interface AuditLogTimelineItemProps {
  item: IAudit;
  isLast?: boolean;
}

const AuditLogTimelineItem = ({ item, isLast }: AuditLogTimelineItemProps) => {
  const { t } = useLanguage();
  
  const getActionStyles = (action: AuditAction) => {
    switch (action) {
      case AuditAction.CREATE:
        return { color: "text-green-600", bg: "bg-green-500/10", icon: PlusCircle };
      case AuditAction.UPDATE:
        return { color: "text-blue-600", bg: "bg-blue-500/10", icon: Pencil };
      case AuditAction.DELETE:
        return { color: "text-red-600", bg: "bg-red-500/10", icon: MinusCircle };
      case AuditAction.RESTORE:
        return { color: "text-purple-600", bg: "bg-purple-500/10", icon: RefreshCcw };
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", icon: History };
    }
  };

  const styles = getActionStyles(item.action);
  const Icon = styles.icon;

  const renderChanges = () => {
    if (!item.changes || typeof item.changes !== "object") return null;

    const changeEntries = Object.entries(item.changes);
    if (changeEntries.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-muted-foreground/10 space-y-3">
        {changeEntries.map(([key, value]: [string, any]) => (
          <div key={key} className="space-y-1">
            <span className="text-[10px] font-bold uppercase text-primary">
              {key}:
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 line-through">
                {JSON.stringify(value.from) || "null"}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-semibold">
                {JSON.stringify(value.to) || "null"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex gap-4">
      {/* Timeline Line & Icon */}
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm z-10", styles.bg, styles.color)}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-muted-foreground/20 my-1" />
        )}
      </div>

      {/* Content Card */}
      <div className={cn("flex-1 rounded-xl border bg-card p-4 shadow-sm mb-6")}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {item.user?.name || t("common.notSpecified")}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px] font-bold border-none", styles.bg, styles.color)}
          >
            {t(`audit.action.${item.action.toLowerCase()}`)}
          </Badge>
        </div>

        {renderChanges()}
      </div>
    </div>
  );
};

export default AuditLogTimelineItem;
