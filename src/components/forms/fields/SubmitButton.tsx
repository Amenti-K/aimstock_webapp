import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  title: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string; // Add className prop for flexibility
  type?: "submit" | "button" | "reset";
}

const SubmitButton = ({
  title,
  onClick,
  loading = false,
  disabled = false,
  className,
  type = "submit",
}: Props) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full ${className || ""}`}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {title}
    </Button>
  );
};

export default SubmitButton;
