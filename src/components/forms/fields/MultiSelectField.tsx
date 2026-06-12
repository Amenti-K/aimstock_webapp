"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

const MultiSelectField = ({
  name,
  label,
  control,
  placeholder,
  options,
  disabled = false,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => {
        const selectedValues = Array.isArray(value) ? value : [];

        return (
          <div className="space-y-1.5 shrink-0">
            {label && (
              <Label
                htmlFor={name}
                className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70 ml-1 whitespace-nowrap"
              >
                {label}
              </Label>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-between rounded-xl bg-muted/30 border-none shadow-none hover:bg-muted/50 h-10 px-3",
                    selectedValues.length > 0 &&
                      "text-primary ring-1 ring-primary/20",
                    error && "ring-1 ring-destructive",
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Filter className="h-4 w-4 shrink-0 opacity-50 text-muted-foreground" />
                    <span className="truncate text-[11px] font-medium">
                      {selectedValues.length > 0
                        ? t("inventory.tabs.categorySelected", {
                            count: selectedValues.length,
                            defaultValue: `${selectedValues.length} Selected`,
                          })
                        : t("inventory.tabs.noneSelected", {
                            defaultValue: "None Selected",
                          })}
                    </span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 p-2 bg-card rounded-2xl shadow-xl border-none"
                align="start"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      {label || placeholder}
                    </span>
                    {selectedValues.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange([]);
                        }}
                        className="h-6 px-2 text-[10px] text-destructive rounded-full hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                    {options.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => {
                          const newValue = selectedValues.includes(option.value)
                            ? selectedValues.filter(
                                (v: string) => v !== option.value,
                              )
                            : [...selectedValues, option.value];
                          onChange(newValue);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors",
                          selectedValues.includes(option.value)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted",
                        )}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center transition-all",
                            selectedValues.includes(option.value)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/30",
                          )}
                        >
                          {selectedValues.includes(option.value) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="text-xs font-medium truncate">
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {error && (
              <p className="text-[10px] font-medium text-destructive ml-1">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default MultiSelectField;
