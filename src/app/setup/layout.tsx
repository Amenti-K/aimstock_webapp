"use client";

import React, { useEffect, useState } from "react";
import logo from "@/../public/logo.png";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Loader2, Languages, LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userAuthSlice";

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, language, changeLanguage } = useLanguage();
  const { accessToken, company, loading } = useAppSelector(
    (state) => state.userAuth,
  );
  const [isReady, setIsReady] = useState(false);
  const handleLogout = () => {
    dispatch(logoutUser());
  };

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

          <div className="flex items-center gap-2">
            {/* Logout Section */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  // variant="outline"
                  className="flex items-center bg-red-500/10 text-red-500 justify-center gap-2 rounded-xl py-6 text-base font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogOut className="h-5 w-5" />
                  {t("common.confirmLogout.title")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("common.confirmLogout.title")}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("common.confirmLogout.message")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("common.confirmLogout.title")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
        </div>
      </header>
      <main className="flex w-full px-4 py-8 max-w-5xl mx-auto h-full">
        {children}
      </main>
    </div>
  );
}
