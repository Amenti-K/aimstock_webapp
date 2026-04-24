"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Clock, ArrowUpRight, ArrowDownLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import LastAudit from "../audit/LastAudit";
import { ILastAudit } from "../interface/auditLog/interface.audit";

interface OrderHeaderCardProps {
  orderNumber: string;
  partner?: { name: string; phone?: string };
  createdAt: string | Date;
  description?: string;
  totalAmount: number;
  paidAmount: number;
  loanAmount: number;
  type: "purchase" | "sale";
  lastAuditLog?: ILastAudit | null;
}

export function OrderHeaderCard({
  orderNumber,
  partner,
  createdAt,
  description,
  totalAmount,
  paidAmount,
  loanAmount,
  type,
  lastAuditLog,
}: OrderHeaderCardProps) {
  const isPurchase = type === "purchase";
  const balance = totalAmount - paidAmount;

  return (
    <div className="flex flex-col gap-6">
      {/* Primary Info Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider",
                isPurchase
                  ? "bg-blue-100 text-blue-700"
                  : "bg-emerald-100 text-emerald-700",
              )}
            >
              {orderNumber}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
          <LastAudit lastAudit={lastAuditLog} />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {partner?.name ||
              (isPurchase ? "General Supplier" : "Walk-in Customer")}
          </h1>
          {partner?.phone && (
            <p className="text-sm text-muted-foreground">{partner.phone}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-medium text-muted-foreground">
            Total Amount
          </span>
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <div className="rounded-full p-1.5 bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Paid Amount
            </span>
          </div>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(paidAmount)}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <div className="rounded-full p-1.5 bg-rose-50 text-rose-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Loan / Pending
            </span>
          </div>
          <p className="text-xl font-bold text-rose-600">
            {formatCurrency(loanAmount)}
          </p>
        </div>

        <div
          className={cn(
            "rounded-2xl border p-4 shadow-sm",
            balance <= 0
              ? "bg-emerald-100 border-emerald-100"
              : "bg-amber-100 border-amber-100",
          )}
        >
          <div className="flex items-center gap-3 mb-2 text-muted-foreground">
            <div
              className={cn(
                "rounded-full p-1.5",
                balance <= 0
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600",
              )}
            >
              <Info className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">
              Balance
            </span>
          </div>
          <p
            className={cn(
              "text-xl font-bold",
              balance <= 0 ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {description && (
        <div className="rounded-2xl border bg-muted/30 p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Note
          </span>
          <p className="text-sm text-foreground italic">"{description}"</p>
        </div>
      )}
    </div>
  );
}
