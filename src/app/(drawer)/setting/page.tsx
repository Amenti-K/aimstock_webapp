"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { UserCard } from "@/components/setting/UserCard";
import {
  SettingItem,
  SettingSection,
} from "@/components/setting/SettingComponents";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Building,
  CreditCard,
  Palette,
  Languages,
  LogOut,
} from "lucide-react";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "Amharic" },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, company } = useSelector((state: RootState) => state.userAuth);

  const [isThemeModalOpen, setIsThemeModalOpen] = React.useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = React.useState(false);
  const [language, setLanguage] = React.useState<string>("en");

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div className="hidden sm:block">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, organization, and display preferences.
        </p>
      </div>

      {/* User Profile Card */}
      <UserCard user={user} company={company} />

      <div className="space-y-8">
        {/* Account Section */}
        <SettingSection title="Account & Security">
          <SettingItem
            icon={<User className="h-5 w-5" />}
            title="Profile Information"
            href="/setting/account/profile"
          />
          <SettingItem
            icon={<Shield className="h-5 w-5" />}
            title="Security & Login"
            href="/setting/account/security"
            last={user?.role.name !== "OWNER"}
          />
          {user?.role.name === "OWNER" && (
            <SettingItem
              icon={<Building className="h-5 w-5" />}
              title="Company Info"
              href="/setting/company/profile"
            />
          )}
          {user?.role.name === "OWNER" && (
            <SettingItem
              icon={<CreditCard className="h-5 w-5" />}
              title="Subscription"
              href="/setting/company/subscription"
              last
            />
          )}
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection title="Preferences">
          <SettingItem
            icon={<Palette className="h-5 w-5" />}
            title="Theme Appearance"
            onClick={() => setIsThemeModalOpen(true)}
          />
          <SettingItem
            icon={<Languages className="h-5 w-5" />}
            title="Language"
            onClick={() => setIsLanguageModalOpen(true)}
            last
          />
        </SettingSection>

        {/* Logout Section */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-6 text-base font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to sign out?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex flex-col items-center gap-1 pt-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Version 1.0.0 (Web)
          </p>
          <p className="text-xs text-muted-foreground/60">
            Developed by AimStock Team
          </p>
        </div>
      </div>

      {/* Theme Modal */}
      <Dialog open={isThemeModalOpen} onOpenChange={setIsThemeModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Theme Appearance</DialogTitle>
            <DialogDescription>
              Customize how the application looks for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl border-2"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-6 w-6 text-amber-500" />
              <span className="font-bold uppercase text-[10px] tracking-widest">
                Light
              </span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl border-2"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-6 w-6 text-indigo-400" />
              <span className="font-bold uppercase text-[10px] tracking-widest">
                Dark
              </span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="h-24 flex-col gap-2 rounded-2xl border-2"
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-6 w-6 text-primary" />
              <span className="font-bold uppercase text-[10px] tracking-widest">
                System
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Modal */}
      <Dialog open={isLanguageModalOpen} onOpenChange={setIsLanguageModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Interface Language</DialogTitle>
            <DialogDescription>
              Choose your preferred language for the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                className={cn(
                  "w-full justify-between h-16 rounded-2xl px-6 border-2 transition-all",
                  language === lang.code ? "border-primary" : "border-border",
                )}
                onClick={() => {
                  setLanguage(lang.code);
                  toast({
                    title: "Language preference selected",
                    description: `${lang.label} will be applied once i18n wiring is connected.`,
                  });
                }}
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-black text-sm uppercase tracking-tight">
                    {lang.native}
                  </span>
                  <span className="text-[10px] font-bold uppercase opacity-60 tracking-wider">
                    {lang.label}
                  </span>
                </div>
                {language === lang.code && (
                  <Check className="h-5 w-5 animate-in zoom-in" />
                )}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
