"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/language.hook";

interface GenericEntityViewerProps {
  data: any;
  level?: number;
  label?: string | React.ReactNode;
}

const GenericEntityViewer: React.FC<GenericEntityViewerProps> = ({
  data,
  level = 0,
  label,
}) => {
  const [expanded, setExpanded] = useState(level < 1); // Expand first level by default
  const { t } = useLanguage();

  const isObject = (val: any) => val !== null && typeof val === "object";
  const isArray = Array.isArray(data);

  if (data === null || data === undefined) {
    return (
      <div className={cn("flex items-center gap-2 py-1", level > 0 && "ml-4")}>
        {label && (
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            {label}:
          </span>
        )}
        <span className="text-xs text-muted-foreground italic">null</span>
      </div>
    );
  }

  if (!isObject(data)) {
    return (
      <div className={cn("flex items-center gap-2 py-1", level > 0 && "ml-4")}>
        {label && (
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            {label}:
          </span>
        )}
        <span className="text-xs font-medium">
          {typeof data === "boolean" ? (data ? "True" : "False") : String(data)}
        </span>
      </div>
    );
  }

  const keys = Object.keys(data);
  if (keys.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 py-1", level > 0 && "ml-4")}>
        {label && (
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            {label}:
          </span>
        )}
        <span className="text-xs text-muted-foreground font-mono">
          {isArray ? "[]" : "{}"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", level > 0 ? "ml-4 border-l pl-3" : "")}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 py-2 px-2 w-full text-left rounded-md transition-colors hover:bg-muted/50",
          level === 0 && "bg-muted/30"
        )}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-primary" />
        ) : (
          <ChevronRight className="h-4 w-4 text-primary" />
        )}
        {label && (
          <span className="text-xs font-bold uppercase text-primary">
            {label}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground">
          {isArray ? `[${data.length} ${t("common.unit.items")}]` : `{${keys.length} ${t("audit.fields", { defaultValue: "fields" })}}`}
        </span>
      </button>

      {expanded && (
        <div className="space-y-1 py-1">
          {keys.map((key) => (
            <GenericEntityViewer
              key={key}
              data={data[key]}
              level={level + 1}
              label={isArray ? undefined : key}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GenericEntityViewer;
