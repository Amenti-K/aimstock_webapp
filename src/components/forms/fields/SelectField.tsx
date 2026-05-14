"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

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
  /** When true, renders an "Add New" item at the bottom of the list */
  canAdd?: boolean;
  /** Label for the add item; defaults to "Add New" */
  addLabel?: string;
  /** Called when the user clicks the add item */
  onAddClick?: () => void;
}

const SelectField = ({
  name,
  label,
  control,
  placeholder,
  disabled = false,
  options,
  onValueChange,
  canAdd = false,
  addLabel = "Add New",
  onAddClick,
}: Props) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="space-y-1.5 shrink-0">
          {label && (
            <Label
              htmlFor={name}
              className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground/70 ml-1 whitespace-nowrap"
            >
              {label}
            </Label>
          )}
          <Select
            onValueChange={(val) => {
              if (val === "__add_new__") {
                onAddClick?.();
                return;
              }
              onChange(val);
              if (onValueChange) onValueChange(val);
            }}
            value={value !== undefined && value !== null ? String(value) : ""}
            disabled={disabled}
          >
            <SelectTrigger className={`w-full ${error ? "border-red-500" : ""}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}

              {canAdd && (
                <>
                  <SelectSeparator />
                  <SelectItem
                    value="__add_new__"
                    className="text-primary font-semibold focus:text-primary focus:bg-primary/10"
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="size-4" />
                      {addLabel}
                    </span>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm font-medium text-destructive">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default SelectField;
