"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DateField = ({
  name,
  control,
  label,
  placeholder,
  className,
}: DateFieldProps) => {
  return (
    <div className={cn("space-y-2 flex flex-col", className)}>
      {label && (
        <Label className="text-sm font-semibold text-foreground/80 ml-1">
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full px-4 justify-start text-left font-normal rounded-2xl border-primary/10 bg-background backdrop-blur-sm hover:bg-background hover:border-primary/30 transition-all",
                  !field.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {field.value ? (
                  format(new Date(field.value), "PPP")
                ) : (
                  <span>{placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-background rounded-2xl shadow-2xl border-primary/20"
              align="start"
            >
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => field.onChange(date?.toISOString())}
                initialFocus
                className="rounded-2xl"
              />
            </PopoverContent>
          </Popover>
        )}
      />
    </div>
  );
};

export default DateField;
