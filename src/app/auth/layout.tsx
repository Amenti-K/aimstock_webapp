"use client";

import logo from "@/../public/logo.png";
import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/language.hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import InstallAppButton from "@/components/common/InstallAppButton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, language, changeLanguage } = useLanguage();

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {/* Left side Marketing Panel */}
      <div className="hidden w-1/2 lg:block relative overflow-hidden bg-muted h-screen sticky top-0">
        <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-overlay dark:bg-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-10" />

        <div className="absolute top-10 left-10 z-20 flex items-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground shadow-lg">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
          </div>
          <span className="text-xl font-bold tracking-tight">AIM Stock</span>
        </div>

        <div className="absolute bottom-12 left-12 right-12 z-20 text-white p-8 rounded-2xl backdrop-blur-md border border-white/10 bg-white/5 shadow-2xl">
          <h2 className="text-3xl font-bold mb-4 tracking-tight leading-tight">
            {t("auth.layout.title")}
          </h2>
          <p className="text-lg text-white/80 leading-relaxed max-w-lg text-pretty font-light">
            {t("auth.layout.description")}
          </p>
        </div>

        <Image
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
          alt="AIM Stock Warehouse"
          width={1000}
          height={1000}
          className="absolute inset-0 object-cover w-full h-full"
        />
      </div>

      {/* Right side Auth Form Container */}
      <div className="flex flex-1 flex-col">
        {/* Auth Header */}
        <div className="flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8 lg:justify-end shrink-0">
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center gap-2 text-primary">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground shadow-md">
              <Image
                src={logo}
                alt="Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
              AIM Stock
            </span>
          </div>

          {/* Right Side Controls */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
            <InstallAppButton />

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Languages className="h-4 w-4" />
                  <span className="uppercase font-semibold text-xs tracking-wider">
                    {language === "am" ? "አማርኛ" : "English"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => changeLanguage("en")}
                  className="flex items-center gap-3 font-medium"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage("am")}
                  className="flex items-center gap-3 font-medium"
                >
                  አማርኛ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-20 xl:px-32">
          <div className="mx-auto w-full max-w-md animate-in fade-in duration-700 slide-in-from-bottom-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
