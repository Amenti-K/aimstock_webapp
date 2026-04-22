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

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user, company } = useSelector((state: RootState) => state.userAuth);

  const handleLogout = () => {
    dispatch(logoutUser());
    // Redirect logic usually handled by a guard or layout listener
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      <div>
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
            href="/setting/preferences/theme"
          />
          <SettingItem
            icon={<Languages className="h-5 w-5" />}
            title="Language"
            href="/setting/preferences/language"
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
    </div>
  );
}
