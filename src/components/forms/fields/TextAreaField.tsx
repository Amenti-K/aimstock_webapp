"use client";

import React from "react";
import { Control, Controller } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  disabled?: boolean;
}

const TextAreaField = ({
  name,
  label,
  control,
  placeholder,
  disabled = false,
}: Props) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <div className="space-y-2">
          {label && <Label htmlFor={name}>{label}</Label>}
          <Textarea
            id={name}
            placeholder={placeholder}
            onBlur={onBlur}
            onChange={onChange}
            value={value ?? ""}
            disabled={disabled}
            className={error ? "border-red-500" : ""}
          />
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

export default TextAreaField;
