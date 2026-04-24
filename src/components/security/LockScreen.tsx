"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuthLock } from "@/context/AuthLockContext";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Delete, ArrowRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLanguage } from "@/hooks/language.hook";

export function LockScreen() {
  const { isLocked, unlockSession } = useAuthLock();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleKeyPress = useCallback(
    (num: string) => {
      if (pin.length < 6) {
        setPin((prev) => prev + num);
        setError(false);
      }
    },
    [pin],
  );

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (pin.length < 4) return;
    setLoading(true);
    const success = await unlockSession(pin);
    if (!success) {
      setError(true);
      setPin("");
    }
    setLoading(false);
  }, [pin, unlockSession]);

  // Keyboard Support for PC
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, handleKeyPress, handleDelete, handleSubmit]);

  // Clear pin on lock
  useEffect(() => {
    if (isLocked) {
      setPin("");
      setError(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const handleForgotPin = () => {
    if (confirm(t("layout.lockScreen.forgotMessage"))) {
      dispatch(logoutUser());
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md overflow-y-auto py-10">
      <div className="w-full max-w-sm px-6 text-center space-y-6 sm:space-y-8 my-auto">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 sm:p-4 rounded-full bg-primary/10 text-primary mb-1 sm:mb-2">
            <Lock className="h-6 w-6 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {t("layout.lockScreen.locked")}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {error
              ? t("layout.lockScreen.incorrectPin")
              : t("layout.lockScreen.enterPin")}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 sm:gap-4 py-2 sm:py-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 transition-all",
                pin.length > i
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30",
                error && "border-destructive bg-destructive animate-shake",
              )}
            />
          ))}
        </div>

        {/* Keypad - Using custom buttons to avoid native numeric pad on mobile */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[280px] sm:max-w-none mx-auto">
          {keys.map((key) => {
            if (key === "delete") {
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="lg"
                  className="h-14 sm:h-16 text-xl active:bg-primary/10"
                  onClick={handleDelete}
                  type="button"
                >
                  <Delete className="h-5 w-5 sm:h-6" />
                </Button>
              );
            }
            if (key === "forgot") {
              return (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  className="h-14 sm:h-16 text-[10px] sm:text-xs text-muted-foreground active:bg-primary/10"
                  onClick={handleForgotPin}
                  type="button"
                >
                  {t("layout.lockScreen.forgot")}
                </Button>
              );
            }
            return (
              <Button
                key={key}
                variant="outline"
                size="lg"
                className="h-14 sm:h-16 text-xl sm:text-2xl font-medium hover:bg-primary hover:text-primary-foreground active:bg-primary transition-all rounded-xl"
                onClick={() => handleKeyPress(key)}
                type="button"
              >
                {key}
              </Button>
            );
          })}
        </div>

        <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-4">
          <Button
            className="w-full h-12 text-lg rounded-xl"
            disabled={pin.length < 4 || loading}
            onClick={handleSubmit}
            type="button"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-5 w-5" />
            )}
            {t("layout.lockScreen.unlock")}
          </Button>

          <Button
            variant="link"
            className="w-full text-muted-foreground text-sm"
            onClick={() => dispatch(logoutUser())}
            type="button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("layout.lockScreen.switchAccount")}
          </Button>
        </div>
      </div>
    </div>
  );
}
