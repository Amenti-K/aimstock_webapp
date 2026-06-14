"use client";

import React, { useState, useRef, useEffect } from "react";
import { Control, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";

interface Option {
  label: string;
  value: string;
}

interface Props {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  disabled?: boolean;
  options: Option[];
  onValueChange?: (value: string) => void;
  /** Placeholder shown inside the search input (defaults to common.search translation) */
  searchPlaceholder?: string;
  /** Message shown when no options match the search query (defaults to common.noResults translation) */
  emptyMessage?: string;
  clearable?: boolean;
}

const SelectSearchField = ({
  name,
  label,
  control,
  placeholder,
  disabled = false,
  options,
  onValueChange,
  searchPlaceholder,
  emptyMessage,
  clearable = true,
}: Props) => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Use translated defaults when props are not explicitly provided
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("common.search");
  const resolvedEmptyMessage = emptyMessage ?? t("common.noResults");
  const resolvedPlaceholder = placeholder ?? t("common.select");

  // Focus the search input whenever the popover opens
  useEffect(() => {
    if (open) {
      // Slight delay lets Radix finish its portal animation
      const timer = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedLabel = options.find(
          (opt) => opt.value === String(value ?? ""),
        )?.label;

        const filteredOptions = options.filter((opt) =>
          opt.label.toLowerCase().includes(search.toLowerCase()),
        );

        return (
          <div className="space-y-2">
            {label && <Label htmlFor={name}>{label}</Label>}

            <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
              {/* Trigger — styled exactly like a SelectTrigger */}
              <PopoverTrigger asChild>
                <button
                  id={name}
                  type="button"
                  disabled={disabled}
                  aria-expanded={open}
                  aria-haspopup="listbox"
                  className={cn(
                    "border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9",
                    error && "border-red-500 ring-red-500/20",
                  )}
                >
                  <span
                    className={cn(
                      "truncate flex-1 text-left",
                      !selectedLabel && "text-muted-foreground",
                    )}
                  >
                    {selectedLabel ?? resolvedPlaceholder}
                  </span>
                  <div className="flex items-center gap-2">
                    {clearable && value && (
                      <CheckIcon
                        className="size-3.5 mr-1 cursor-pointer text-muted-foreground hover:text-destructive transition-colors rotate-45"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onChange("");
                          onValueChange?.("");
                        }}
                      />
                    )}
                    <ChevronDownIcon
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground opacity-50 transition-transform duration-200",
                        open && "rotate-180",
                      )}
                    />
                  </div>
                </button>
              </PopoverTrigger>

              {/* Dropdown panel */}
              <PopoverContent
                className="p-0 bg-background border shadow-md"
                align="start"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                sideOffset={4}
              >
                {/* Search bar */}
                <div className="flex items-center border-b px-2 py-1.5 gap-2">
                  <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={resolvedSearchPlaceholder}
                    className="h-8 border-0 shadow-none focus-visible:ring-0 bg-transparent px-0 text-sm"
                    aria-label={resolvedSearchPlaceholder}
                  />
                </div>

                {/* Options list */}
                <div
                  role="listbox"
                  aria-label={label}
                  className="max-h-60 overflow-y-auto py-1"
                >
                  {clearable && (
                    <button
                      type="button"
                      role="option"
                      onClick={() => {
                        onChange("");
                        onValueChange?.("");
                        setOpen(false);
                      }}
                      className="relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-default select-none transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground italic font-medium"
                    >
                      {t("common.none", { defaultValue: "None" })}
                    </button>
                  )}
                  {filteredOptions.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      {resolvedEmptyMessage}
                    </p>
                  ) : (
                    filteredOptions.map((opt) => {
                      const isSelected = String(value ?? "") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(opt.value);
                            onValueChange?.(opt.value);
                            setOpen(false);
                          }}
                          className={cn(
                            "relative flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-default select-none transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSelected &&
                              "bg-accent/50 font-semibold text-accent-foreground",
                          )}
                        >
                          <span className="flex-1 text-left truncate">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <CheckIcon className="size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {error && (
              <p className="text-sm font-medium text-destructive">
                {error.message}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default SelectSearchField;
