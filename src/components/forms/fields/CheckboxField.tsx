"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckboxFieldProps {
  name: string;
  label?: string;
  /** Rich label content (ReactNode) — renders as an inline paragraph alongside the checkbox. When provided, the border/padded box wrapper is omitted. */
  labelContent?: React.ReactNode;
  control: Control<any>;
  disabled?: boolean;
  description?: string;
}

const CheckboxField = ({
  name,
  label,
  labelContent,
  control,
  disabled = false,
  description,
}: CheckboxFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        // Inline mode — used when a rich ReactNode label is provided
        if (labelContent !== undefined) {
          return (
            <div className="flex flex-row items-center gap-x-2.5 py-4">
              <Checkbox
                id={name}
                checked={!!value}
                onCheckedChange={onChange}
                disabled={disabled}
                className="mt-0.5 shrink-0 w-6 h-6"
              />
              <div className="leading-snug">
                <Label
                  htmlFor={name}
                  className={cn(
                    "text-lg font-normal text-muted-foreground cursor-pointer leading-snug",
                    error && "text-destructive",
                  )}
                  asChild
                >
                  {/* Wrap in a <span> so it renders as a true inline paragraph */}
                  <span>{labelContent}</span>
                </Label>
                {error && (
                  <p className="text-sm font-medium text-destructive pt-1">
                    {error.message}
                  </p>
                )}
              </div>
            </div>
          );
        }

        // Default card mode — plain string label
        return (
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
        );
      }}
    />
  );
};

export default CheckboxField;
