"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SimpleCheckboxFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  disabled?: boolean;
  className?: string;
}

const SimpleCheckboxField = ({
  name,
  label,
  control,
  disabled = false,
  className,
}: SimpleCheckboxFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <div
          className={cn(
            "flex flex-row items-center space-x-3 space-y-0",
            className,
          )}
        >
          <Checkbox
            id={name}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <Label htmlFor={name} className="font-normal cursor-pointer text-sm">
            {label}
          </Label>
        </div>
      )}
    />
  );
};

export default SimpleCheckboxField;
