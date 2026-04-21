"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  disabled?: boolean;
  description?: string;
}

const CheckboxField = ({
  name,
  label,
  control,
  disabled = false,
  description,
}: CheckboxFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            id={name}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor={name}
              className={cn(
                "font-medium cursor-pointer",
                error && "text-destructive",
              )}
            >
              {label}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
              <p className="text-sm font-medium text-destructive pt-1">
                {error.message}
              </p>
            )}
          </div>
        </div>
      )}
    />
  );
};

export default CheckboxField;
