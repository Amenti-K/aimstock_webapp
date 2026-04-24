"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { useAppDispatch } from "@/redux/hooks";

interface AuthLockContextType {
  isLocked: boolean;
  hasPin: boolean;
  isLockEnabled: boolean;
  lockSession: () => void;
  unlockSession: (pin: string) => Promise<boolean>;
  setNewPin: (pin: string) => Promise<void>;
  clearPin: () => void;
  toggleLockEnabled: (enabled: boolean) => void;
}

const AuthLockContext = createContext<AuthLockContextType | undefined>(undefined);

const PIN_STORAGE_KEY = "aim_session_pin_hash";
const LOCK_STATE_KEY = "aim_session_is_locked";
const LOCK_ENABLED_KEY = "aim_session_lock_enabled";

// Helper to hash PIN
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "aim_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function AuthLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [isLockEnabled, setIsLockEnabled] = useState(false);

  // Initialize state from localStorage
  useEffect(() => {
    const savedHash = localStorage.getItem(PIN_STORAGE_KEY);
    const wasLocked = localStorage.getItem(LOCK_STATE_KEY) === "true";
    const enabled = localStorage.getItem(LOCK_ENABLED_KEY) === "true";
    
    setHasPin(!!savedHash);
    setIsLockEnabled(enabled);
    if (savedHash && enabled && wasLocked) {
      setIsLocked(true);
    }
  }, []);

  // Update localStorage and window global
  useEffect(() => {
    localStorage.setItem(LOCK_STATE_KEY, isLocked.toString());
    (window as any).__IS_LOCKED = isLocked;
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem(LOCK_ENABLED_KEY, isLockEnabled.toString());
  }, [isLockEnabled]);

  const lockSession = useCallback(() => {
    if (isLockEnabled && hasPin) {
      setIsLocked(true);
    }
  }, [isLockEnabled, hasPin]);

  const unlockSession = async (pin: string): Promise<boolean> => {
    const savedHash = localStorage.getItem(PIN_STORAGE_KEY);
    if (!savedHash) return true;

    const inputHash = await hashPin(pin);
    if (inputHash === savedHash) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const setNewPin = async (pin: string) => {
    const hashed = await hashPin(pin);
    localStorage.setItem(PIN_STORAGE_KEY, hashed);
    setHasPin(true);
    setIsLockEnabled(true);
    setIsLocked(false);
  };

  const clearPin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.setItem(LOCK_ENABLED_KEY, "false");
    setHasPin(false);
    setIsLockEnabled(false);
    setIsLocked(false);
  };

  const toggleLockEnabled = (enabled: boolean) => {
    setIsLockEnabled(enabled);
  };

  return (
    <AuthLockContext.Provider 
      value={{ 
        isLocked, 
        hasPin, 
        isLockEnabled,
        lockSession, 
        unlockSession, 
        setNewPin, 
        clearPin,
        toggleLockEnabled
      }}
    >
      {children}
    </AuthLockContext.Provider>
  );
}

export function useAuthLock() {
  const context = useContext(AuthLockContext);
  if (context === undefined) {
    throw new Error("useAuthLock must be used within an AuthLockProvider");
  }
  return context;
}
