"use client";

import React from "react";
import { formatCurrency } from "@/lib/formatter";
import { Package, Warehouse, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemListProps {
  items: any[];
  type: "purchase" | "sale";
}

export function ItemList({ items, type }: ItemListProps) {
  const isPurchase = type === "purchase";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Items List
          <span className="ml-2 text-xs font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.map((item, index) => (
          <div 
            key={item.id || index}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-hover hover:border-primary/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-foreground sm:text-base">
                  {item.inventory?.name || "Unknown Product"}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Warehouse className="h-3 w-3" />
                    <span>{item.warehouse?.name || "Default Warehouse"}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">
                  {formatCurrency(Number(item.unitPrice) * Number(item.quantity))}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  at {formatCurrency(item.unitPrice)} / unit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t pt-2 mt-1">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Quantity: {item.quantity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
