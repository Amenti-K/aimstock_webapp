"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function CompanyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, company } = useSelector((state: RootState) => state.userAuth);
  const [companyName, setCompanyName] = useState(company?.name ?? "");

  const handleSave = () => {
    toast({
      title: "Company profile saved locally",
      description: "API wiring for this section will be connected next.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organization Profile
          </CardTitle>
          <CardDescription>Organization profile and ownership-level settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={user?.role.name !== "OWNER"}
            />
          </div>
          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Company ID: <span className="font-medium">{company?.id ?? "N/A"}</span>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={user?.role.name !== "OWNER"}
          >
            Save Company
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
