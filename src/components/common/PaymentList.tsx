"use client";

import React from "react";
import { formatCurrency } from "@/lib/formatter";
import { CreditCard, Wallet, Landmark, Receipt } from "lucide-react";
import { BankAvatar } from "@/components/account/BankAvatar";
import { useLanguage } from "@/hooks/language.hook";

interface PaymentListProps {
  payments?: any[];
  cashPayment?: any;
  loan?: any;
  type: "purchase" | "sale";
}

export function PaymentList({
  payments = [],
  cashPayment,
  loan,
  type,
}: PaymentListProps) {
  const { t } = useLanguage();
  const hasPayments = payments.length > 0 || cashPayment || loan;

  if (!hasPayments) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        {t("common.trade.paymentDetails")}
      </h3>

      <div className="space-y-3">
        {/* Cash Payment Card */}
        {cashPayment && (
          <div className="rounded-2xl border bg-card p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-emerald-100 text-emerald-600">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">
                {t("common.trade.cashPayment")}
              </span>
            </div>
            <span className="text-base font-bold text-foreground">
              {formatCurrency(cashPayment.amount)}
            </span>
          </div>
        )}

        {/* Bank Payments Group Card */}
        {payments.length > 0 && (
          <div className="rounded-2xl border bg-card p-4 shadow-sm flex flex-col gap-3">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-sm font-bold text-foreground">
                {t("common.trade.bankPayments")}
              </span>
            </h4>
            <div className="flex flex-col border-t border-border/50">
              {payments.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border-b border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <BankAvatar
                      name={p.account?.bank}
                      type={p.account?.type}
                      size={36}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-foreground">
                        {p.account?.name || "Bank Account"}
                      </span>
                      {p.account?.bank && (
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          {p.account.bank.replace(/_/g, " ")}{" "}
                          {p.account.accountNumber
                            ? `• ${p.account.accountNumber}`
                            : ""}
                        </span>
                      )}
                      {p.description && (
                        <span className="text-[10px] text-muted-foreground italic mt-0.5 line-clamp-1">
                          "{p.description}"
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-bold text-base text-foreground">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {t("common.trade.received")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loan Card */}
        {loan && (
          <div className="rounded-2xl border bg-rose-500/10 p-4 shadow-sm flex items-center justify-between border-rose-500/20 dark:border-rose-400/30">
            <div className="flex items-center gap-3">
              <div className="rounded-full p-2 bg-rose-100 text-rose-600">
                <Receipt className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-foreground">
                {t("common.trade.outstanding")}
              </span>
            </div>
            <span className="text-base font-bold text-rose-600">
              {formatCurrency(loan.amount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
