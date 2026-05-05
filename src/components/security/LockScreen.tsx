"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  // Use ref to always have latest pin in keyboard handler
  const pinRef = useRef(pin);
  pinRef.current = pin;

  const handleKeyPress = useCallback((num: string) => {
    setPin((prev) => {
      if (prev.length < 6) {
        const newPin = prev + num;
        setError(false);
        return newPin;
      }
      return prev;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const currentPin = pinRef.current; // Always get latest value
    if (currentPin.length < 4 || loading) return;

    setLoading(true);
    setError(false);

    const success = await unlockSession(currentPin);

    if (success) {
      // Unlock successful → component will unmount
      setPin("");
    } else {
      setError(true);
      setPin(""); // Clear on wrong PIN
    }

    setLoading(false);
  }, [unlockSession, loading]);

  // Auto-submit when user enters exactly 6 digits (great UX for PIN)
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin.length, handleSubmit]);

  // Keyboard handling - now stable
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Enter" || e.key === "NumpadEnter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLocked, handleKeyPress, handleDelete, handleSubmit]);

  // Reset when lock state changes
  useEffect(() => {
    if (isLocked) {
      setPin("");
      setError(false);
      setLoading(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "forgot",
    "0",
    "delete",
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md p-0 md:p-8">
      <div className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-16 lg:gap-32 animate-in fade-in zoom-in-95 duration-500">
        {/* LEFT SECTION - Branding */}
        <div className="flex flex-col items-center md:items-start text-center shrink-0">
          {/* ... your branding code unchanged ... */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-2xl md:rounded-[2rem] bg-primary/10 text-primary shadow-2xl ring-1 ring-primary/20">
              <Lock className="h-8 w-8 md:h-12 md:w-12" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                {t("common.layout.lockScreen.locked")}
              </h2>
              <p
                className={cn(
                  "text-sm md:text-lg font-medium max-w-[280px] md:max-w-[320px]",
                  error ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {error
                  ? t("common.layout.lockScreen.incorrectPin")
                  : t("common.layout.lockScreen.enterPin")}
              </p>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="w-full mt-6 space-y-3 hidden md:block">
            <Button
              className="w-full h-14 text-lg font-bold rounded-2xl"
              disabled={pin.length < 4 || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="mr-3 h-6 w-6" />
              )}
              {t("common.layout.lockScreen.unlock")}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-foreground rounded-2xl font-semibold"
              onClick={() => dispatch(logoutUser())}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t("common.layout.lockScreen.switchAccount")}
            </Button>
          </div>
        </div>

        {/* RIGHT SECTION - PIN + Keypad */}
        <div className="flex flex-col items-center w-full max-w-[340px] shrink-0">
          {/* PIN Dots */}
          <div className="flex justify-center gap-3 mb-6 md:mb-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-300",
                  pin.length > i
                    ? "bg-primary border-primary scale-110"
                    : "border-muted-foreground/20 bg-muted/20",
                  error && "border-destructive bg-destructive animate-shake",
                )}
              />
            ))}
          </div>

          {/* Keypad - unchanged */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {keys.map((key) => {
              const isDelete = key === "delete";
              const isForgot = key === "forgot";

              return (
                <Button
                  key={key}
                  variant={isDelete || isForgot ? "ghost" : "outline"}
                  className={cn(
                    "h-14 sm:h-16 md:h-20 rounded-2xl transition-all active:scale-95",
                    !isDelete && !isForgot && "text-xl md:text-2xl font-black",
                  )}
                  onClick={() => {
                    if (isDelete) handleDelete();
                    else if (isForgot) {
                      if (
                        confirm(t("common.layout.lockScreen.forgotMessage"))
                      ) {
                        dispatch(logoutUser());
                      }
                    } else {
                      handleKeyPress(key);
                    }
                  }}
                >
                  {isDelete ? (
                    <Delete className="h-6 w-6" />
                  ) : isForgot ? (
                    ""
                  ) : (
                    key
                  )}
                </Button>
              );
            })}
          </div>

          {/* Mobile action buttons */}
          <div className="w-full mt-6 space-y-2 md:hidden">
            <Button
              className="w-full h-14 text-lg font-bold rounded-2xl"
              disabled={pin.length < 4 || loading}
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="mr-3 h-6 w-6" />
              )}
              {t("common.layout.lockScreen.unlock")}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground hover:text-foreground rounded-2xl font-semibold"
              onClick={() => dispatch(logoutUser())}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t("common.layout.lockScreen.switchAccount")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
