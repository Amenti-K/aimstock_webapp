"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function SetupFinishedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleGoToDashboard = () => {
    // In case there's any final state manipulation needed
    dispatch(setCompanyStep(4));
    router.replace("/dashboard");
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="scale-in-center animate-in fade-in zoom-in duration-700 ease-out fill-mode-forwards delay-150">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
        You're All Set!
      </h1>

      <p className="text-muted-foreground mb-8">
        Your AIM Stock workspace has been successfully set up. You can now start
        managing your inventory and exploring all the features we have to offer.
      </p>

      <Button
        onClick={handleGoToDashboard}
        size="lg"
        className="px-10 h-12 text-base font-semibold w-full sm:w-auto"
      >
        Go to Dashboard
      </Button>
    </div>
  );
}
