"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SwitchFieldProps {
  name: string;
  label?: string;
  control: Control<any>;
  disabled?: boolean;
  description?: string;
}

const SwitchField = ({
  name,
  label,
  control,
  disabled = false,
  description,
}: SwitchFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              {label && (
                <Label
                  htmlFor={name}
                  className={cn(error && "text-destructive")}
                >
                  {label}
                </Label>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>

            <Switch
              id={name}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={disabled}
            />
          </div>

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

export default SwitchField;
