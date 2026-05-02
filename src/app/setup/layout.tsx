"use client";

import React, { useEffect, useState } from "react";
import logo from "@/../public/logo.png";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { language, changeLanguage } = useLanguage();
  const { accessToken, company, loading } = useAppSelector(
    (state) => state.userAuth,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!accessToken) {
      router.replace("/auth/login");
      return;
    }

    if (company?.setupStep === 4) {
      router.replace("/dashboard");
      return;
    }
  }, [isReady, accessToken, company, router]);

  if (!isReady || loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 p-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="AIM" className="h-12 w-12" />
            <span className="text-xl font-bold tracking-tight">
              AIM <span className="text-primary">Stock</span>
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Languages className="h-4 w-4" />
                {language === "am" ? "አማርኛ" : "English"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("am")}>
                አማርኛ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex w-full px-4 py-8 max-w-5xl mx-auto h-full">
        {children}
      </main>
    </div>
  );
}
