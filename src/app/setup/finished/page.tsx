"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCompanyStep } from "@/redux/slices/userAuthSlice";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";
import confetti from "canvas-confetti";

export default function SetupFinishedPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();

  React.useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleGoToDashboard = () => {
    dispatch(setCompanyStep(4));
    router.replace("/dashboard");
  };

  return (
    <div className="w-full max-w-md mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="scale-in-center animate-in fade-in zoom-in duration-700 ease-out fill-mode-forwards delay-150">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4 drop-shadow-sm">
        {t("setup.finished.title")}
      </h1>

      <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
        {t("setup.finished.description")}
      </p>

      <Button
        onClick={handleGoToDashboard}
        size="lg"
        className="px-10 h-14 text-lg font-bold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 group"
      >
        {t("setup.finished.goDashboard")}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
