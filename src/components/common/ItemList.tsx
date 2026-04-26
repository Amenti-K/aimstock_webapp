"use client";

import React from "react";
import { formatCurrency } from "@/lib/formatter";
import {
  Package,
  Warehouse,
  ChevronDown,
  ChevronUp,
  Package2,
  Pin,
  Map,
  MapPin,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/language.hook";

interface ItemListProps {
  items: any[];
  type: "purchase" | "sale";
}

export function ItemList({ items, type }: ItemListProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(true);
  const warehouseCount = new Set(items.map((i) => i.warehouse?.id)).size;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {t(type === "purchase" ? "purchase.detail.accordion.items" : "sales.detail.accordion.items")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("common.trade.inventorySummary", {
              itemCount: items.length,
              warehouseCount,
              itemUnit: t("common.unit.items"),
            })}
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="border-t">
        <div className="grid grid-cols-1">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="flex flex-col gap-2 border-b bg-muted/20 p-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-row gap-x-2">
                  <div className="flex items-center justify-center">
                    <Package2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {item.inventory?.name || "Unknown Product"}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{item.warehouse?.name || "Default Warehouse"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(
                      Number(item.unitPrice) * Number(item.quantity),
                    )}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    {formatCurrency(item.unitPrice)} × {item.quantity}{" "}
                    {t("common.unit.items")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
