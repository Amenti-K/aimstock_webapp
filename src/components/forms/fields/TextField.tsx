"use client";

import React, { useState } from "react";
import { Control, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  secureTextEntry?: boolean;
  multiLine?: boolean;
}

const TextField = ({
  name,
  label,
  control,
  placeholder,
  disabled = false,
  type = "text",
  secureTextEntry = false,
  multiLine = false,
}: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => setIsPasswordVisible((prev) => !prev);

  // Determine input type
  const inputType = secureTextEntry
    ? isPasswordVisible
      ? "text"
      : "password"
    : type;

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
          <div className="relative">
            <Input
              id={name}
              placeholder={placeholder}
              onBlur={onBlur}
              onChange={onChange}
              value={value ?? ""}
              disabled={disabled}
              type={inputType}
              className={error ? "border-red-500" : ""}
            />
            {secureTextEntry && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={toggleVisibility}
              >
                {isPasswordVisible ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
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

export default TextField;
