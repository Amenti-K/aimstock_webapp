import React from "react";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingViewProps {
  message?: string;
}

export const LoadingView = ({ message = "Loading..." }: LoadingViewProps) => {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

interface ErrorViewProps {
  message?: string;
  refetch?: () => void;
  title?: string;
}

export const ErrorView = ({
  message = "Something went wrong.",
  refetch,
  title = "Error",
}: ErrorViewProps) => {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {refetch && (
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
};
