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
          <CardContent className="px-2 sm:px-6 pb-6 pt-0">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <SummaryItem
                icon={<Landmark className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Bank"
                value={dailyReport?.totalPaidByBank ?? 0}
                color="text-blue-600 dark:text-blue-400"
                bgColor="bg-blue-500/10 dark:bg-blue-500/20"
                borderColor="border-blue-500/20 dark:border-blue-500/30"
                isLoading={isLoading}
              />
              <SummaryItem
                icon={<Wallet className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Cash"
                value={dailyReport?.totalPaidByCash ?? 0}
                color="text-emerald-600 dark:text-emerald-400"
                bgColor="bg-emerald-500/10 dark:bg-emerald-500/20"
                borderColor="border-emerald-500/20 dark:border-emerald-500/30"
                isLoading={isLoading}
              />
              <SummaryItem
                icon={<Banknote className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Loan"
                value={dailyReport?.totalLoan ?? 0}
                color="text-rose-600 dark:text-rose-400"
                bgColor="bg-rose-500/10 dark:bg-rose-500/20"
                borderColor="border-rose-500/20 dark:border-rose-500/30"
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
        "flex flex-col gap-1.5 sm:gap-3 rounded-xl border p-2.5 sm:p-4 transition-all duration-300 hover:shadow-md backdrop-blur-sm",
        bgColor,
        borderColor,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
        <div className={cn("hidden sm:flex rounded-lg p-2 bg-background/50 shadow-sm shrink-0", color)}>
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn("sm:hidden rounded-md p-1 bg-background/50 shrink-0", color)}>
            {icon}
          </div>
          <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </span>
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        {isLoading ? (
          <Skeleton className="h-6 sm:h-8 w-full bg-muted/50" />
        ) : (
          <span
            className={cn(
              "text-sm sm:text-xl md:text-2xl font-black tracking-tight truncate",
              isNegative && value > 0 ? color : "text-foreground",
            )}
          >
            {formatCurrency(value)}
          </span>
        )}
      </div>
    </div>
  );
}

