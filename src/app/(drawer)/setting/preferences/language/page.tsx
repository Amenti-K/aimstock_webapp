"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "Amharic" },
];

export default function LanguagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [language, setLanguage] = useState<string>("en");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Language Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Interface Language
          </CardTitle>
          <CardDescription>Choose your preferred language for the system.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className="w-full justify-between h-14 rounded-xl px-4"
              onClick={() => {
                setLanguage(lang.code);
                toast({
                  title: "Language preference selected",
                  description: `${lang.label} will be applied once i18n wiring is connected.`,
                });
              }}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{lang.native}</span>
                <span className="text-xs opacity-70">{lang.label}</span>
              </div>
              {language === lang.code && <Check className="h-5 w-5" />}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
