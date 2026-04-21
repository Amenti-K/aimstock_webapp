"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoanInitialForm from "@/components/forms/loan/LoanInitialForm";

export default function NewLoanPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Initial Loan</h1>
          <p className="text-sm text-muted-foreground">
            Create a new partner loan and record the initial transaction.
          </p>
        </div>
      </div>

      <div className="p-6 bg-card rounded-xl border shadow-sm">
        <LoanInitialForm 
          onSuccess={() => router.push("/app/loan")}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
