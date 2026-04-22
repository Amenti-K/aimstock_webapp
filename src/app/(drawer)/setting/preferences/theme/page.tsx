"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, ArrowLeft, Sun, Moon, Laptop } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ThemePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Theme Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your interface.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-6 w-6" />
              <span>Light Mode</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-6 w-6" />
              <span>Dark Mode</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl"
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-6 w-6" />
              <span>System</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
