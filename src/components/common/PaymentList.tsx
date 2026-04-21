"use client";

import React from "react";
import { formatCurrency, formatDate } from "@/lib/formatter";
import { CreditCard, Wallet, Landmark, Receipt, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentListProps {
  payments?: any[];
  cashPayment?: any;
  loan?: any;
  type: "purchase" | "sale";
}

export function PaymentList({ payments = [], cashPayment, loan, type }: PaymentListProps) {
  const hasPayments = payments.length > 0 || cashPayment || loan;

  if (!hasPayments) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Payment Details
      </h3>

      <div className="space-y-3">
        {/* Bank Payments */}
        {payments.map((payment, index) => (
          <PaymentItem
            key={payment.id || index}
            icon={<Landmark className="h-4 w-4" />}
            label={payment.account?.name || "Bank Account"}
            amount={payment.amount}
            date={payment.createdAt}
            description={payment.description}
            type="bank"
          />
        ))}

        {/* Cash Payment */}
        {cashPayment && (
          <PaymentItem
            icon={<Wallet className="h-4 w-4" />}
            label="Cash Payment"
            amount={cashPayment.amount}
            description={cashPayment.description}
            type="cash"
          />
        )}

        {/* Loan */}
        {loan && (
          <PaymentItem
            icon={<Receipt className="h-4 w-4" />}
            label="Loan / Deferred"
            amount={loan.amount}
            description={loan.description}
            type="loan"
            isStatus
          />
        )}
      </div>
    </div>
  );
}

function PaymentItem({ 
  icon, 
  label, 
  amount, 
  date, 
  description, 
  type,
  isStatus
}: { 
  icon: React.ReactNode; 
  label: string; 
  amount: number; 
  date?: string | Date;
  description?: string;
  type: 'bank' | 'cash' | 'loan';
  isStatus?: boolean;
}) {
  const isLoan = type === 'loan';
  
  return (
    <div className={cn(
      "flex flex-col gap-2 rounded-2xl border p-4 shadow-sm",
      isLoan ? "bg-rose-50/30 border-rose-100" : "bg-card"
    )}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-full p-2",
            type === 'bank' && "bg-blue-100 text-blue-600",
            type === 'cash' && "bg-emerald-100 text-emerald-600",
            type === 'loan' && "bg-rose-100 text-rose-600"
          )}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">{label}</span>
            {date && (
              <span className="text-xs text-muted-foreground">{formatDate(date)}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-base font-bold",
            isLoan ? "text-rose-600" : "text-foreground"
          )}>
            {formatCurrency(amount)}
          </span>
        </div>
      </div>
      
      {description && (
        <div className="mt-1 flex items-start gap-2 text-xs text-muted-foreground border-t pt-2 italic">
          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span>{description}</span>
        </div>
      )}
    </div>
  );
}
