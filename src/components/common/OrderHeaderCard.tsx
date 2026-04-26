"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { Calendar, Clock, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import LastAudit from "../audit/LastAudit";
import { ILastAudit } from "../interface/auditLog/interface.audit";
import { useLanguage } from "@/hooks/language.hook";
import { Card } from "../ui/card";

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
  const { t } = useLanguage();
  const isPurchase = type === "purchase";
  const balance = totalAmount - paidAmount;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Primary Info Header */}
      <Card className="flex flex-col p-5 sm:p-6 gap-6 relative overflow-hidden border-0 sm:border shadow-sm">
        <div className="absolute right-0 top-0 scale-90 origin-left sm:origin-top-right opacity-80 mt-1 sm:mt-0">
          <LastAudit lastAudit={lastAuditLog} />
        </div>
        {/* Background Accent */}
        <div
          className={cn(
            "absolute -right-10 -top-10 w-48 h-48 blur-3xl -z-10 rounded-full opacity-[0.15]",
            isPurchase ? "bg-blue-500" : "bg-emerald-500",
          )}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 z-10">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("common.trade.order", {
                type: isPurchase
                  ? t("purchase.moduleName")
                  : t("sales.moduleName"),
              })}
            </span>
            <div className="flex flex-row sm:items-center gap-3">
              <span className="inline-flex items-center text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
                #{orderNumber}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md w-fit">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 pt-5 border-t border-border/50 z-10">
          <div
            className={cn(
              "p-3.5 rounded-2xl shadow-sm border",
              isPurchase
                ? "bg-blue-50/80 border-blue-100 text-blue-700"
                : "bg-emerald-50/80 border-emerald-100 text-emerald-700",
            )}
          >
            <User className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {isPurchase
                ? t("purchase.card.supplier")
                : t("sales.card.customer")}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight">
              {partner?.name ||
                (isPurchase
                  ? t("purchase.card.supplier")
                  : t("sales.card.walkingCust"))}
            </h1>
            {partner?.phone && (
              <p className="text-sm font-medium text-muted-foreground flex gap-1.5 items-center mt-1">
                <Phone className="h-4 w-4" />
                {partner.phone}
              </p>
            )}
          </div>
        </div>

        {description && (
          <div className="rounded-xl border border-dashed bg-muted/20 p-4 mt-2 z-10">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
              Note
            </span>
            <p className="text-sm text-foreground italic leading-relaxed">
              "{description}"
            </p>
          </div>
        )}
      </Card>

      {/* Financial Summary Cards */}
      <div
        className={cn(
          "grid gap-3 sm:gap-4",
          loanAmount > 0 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2",
        )}
      >
        <div className="rounded-2xl border bg-card p-4 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            {t("common.trade.total")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-sm flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            {isPurchase ? t("common.trade.paid") : t("common.trade.received")}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">
            {formatCurrency(paidAmount)}
          </span>
        </div>

        {loanAmount > 0 && (
          <div className="col-span-2 sm:col-span-1 rounded-2xl border bg-rose-500/10 p-4 shadow-sm flex flex-col gap-1.5 border-rose-500/20 dark:border-rose-400/30">
            <span className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wide">
              {t("common.trade.outstanding")}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(loanAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
