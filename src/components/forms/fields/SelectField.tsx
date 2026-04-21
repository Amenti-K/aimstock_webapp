"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
}

const SelectField = ({
  name,
  label,
  control,
  placeholder,
  disabled = false,
  options,
}: Props) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Select onValueChange={onChange} value={value} disabled={disabled}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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
