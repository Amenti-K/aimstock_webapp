"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Banknote,
  Landmark,
  Wallet,
  Calendar as CalendarIcon,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";

type DailyReportData = {
  totalPaidByBank?: number;
  totalPaidByCash?: number;
  totalLoan?: number;
};

type DailyReportProps = {
  dailyReport?: DailyReportData | null;
  date: Date | null;
  setDate: (d: Date | undefined) => void;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
};

export function DailyReport({
  dailyReport,
  date,
  setDate,
  isLoading,
  title = "Daily Report",
  subtitle = "Summary for selected date",
}: DailyReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 h-9 px-3 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm transition-all hover:bg-background hover:shadow-md",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline-block">
                    {date ? formatDate(date) : "Select Date"}
                  </span>
                  <span className="sm:hidden">
                    {date ? formatDate(date) : "Date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 rounded-2xl shadow-2xl bg-background border-primary"
                align="end"
              >
                <Calendar
                  mode="single"
                  selected={date || undefined}
                  onSelect={(d) => {
                    setDate(d ? d : undefined);
                    setIsPopoverOpen(false);
                  }}
                  initialFocus
                  className="rounded-2xl bg-background"
                />
              </PopoverContent>
            </Popover>

            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-xl hover:bg-primary/10"
              >
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-primary" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <CardContent className="px-4 pb-6 pt-0 sm:px-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryItem
                icon={<Landmark className="h-5 w-5" />}
                label="Paid by Bank"
                value={dailyReport?.totalPaidByBank ?? 0}
                color="text-blue-600"
                bgColor="bg-blue-50"
                borderColor="border-blue-100"
                isLoading={isLoading}
              />
              <SummaryItem
                icon={<Wallet className="h-5 w-5" />}
                label="Paid by Cash"
                value={dailyReport?.totalPaidByCash ?? 0}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
                borderColor="border-emerald-100"
                isLoading={isLoading}
              />
              <SummaryItem
                icon={<Banknote className="h-5 w-5" />}
                label="Total Loan"
                value={dailyReport?.totalLoan ?? 0}
                color="text-rose-600"
                bgColor="bg-rose-200"
                borderColor="border-rose-100"
                isNegative
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function SummaryItem({
  icon,
  label,
  value,
  color,
  bgColor,
  borderColor,
  isNegative,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  isNegative?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
        bgColor,
        borderColor,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2 bg-muted-black shadow-sm", color)}>
          {icon}
        </div>
        <span className="text-sm font-medium text-black">{label}</span>
      </div>
      <div className="flex flex-col">
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-black" />
        ) : (
          <span
            className={cn(
              "text-2xl font-bold tracking-tight",
              isNegative && value > 0 ? "text-rose-600" : "text-black",
            )}
          >
            {formatCurrency(value)}
          </span>
        )}
      </div>
    </div>
  );
}
