import React from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/language.hook";

interface AccessDeniedViewProps {
  message?: string;
  moduleName?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  message,
  moduleName,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-1 items-center justify-center p-6 min-h-[60vh]">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-destructive">
            {t("guard.permission.accessRestricted")}
          </h2>
          {moduleName && (
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("guard.permission.module")}: {moduleName}
            </p>
          )}
          <p className="mt-4 text-muted-foreground">
            {message ?? t("guard.permission.accessDeniedMessage")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
