"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTheme } from "next-themes";
import { RootState } from "@/redux/store";
import { useSubscription } from "@/context/SubscriptionContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Shield,
  Building,
  CreditCard,
  Palette,
  Languages,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/formatter";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "am", label: "Amharic", native: "Amharic" },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, company } = useSelector((state: RootState) => state.userAuth);
  const { theme, setTheme } = useTheme();
  const {
    subscription,
    isActive,
    isTrialing,
    isPastDue,
    isExpired,
    daysLeft,
  } = useSubscription();
  const [name, setName] = useState(user?.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
  const [companyName, setCompanyName] = useState(company?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState<string>("en");

  const statusMeta = useMemo(() => {
    if (isActive) {
      return {
        label: "Active",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        style:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    }
    if (isTrialing) {
      return {
        label: "Trialing",
        icon: <Clock3 className="h-4 w-4 text-amber-600" />,
        style:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    }
    if (isPastDue) {
      return {
        label: "Past Due",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }
    if (isExpired) {
      return {
        label: "Expired",
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        style: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
      };
    }

    return {
      label: "Inactive",
      icon: <Clock3 className="h-4 w-4 text-muted-foreground" />,
      style: "border-border bg-muted text-muted-foreground",
    };
  }, [isActive, isTrialing, isPastDue, isExpired]);

  const savePlaceholder = (section: string) => {
    toast({
      title: `${section} saved locally`,
      description: "API wiring for this section will be connected next.",
    });
  };

  const savePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Fill all password fields before saving.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation should match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password updated locally",
      description: "Password endpoint integration is next.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Setting</h1>
        <p className="text-sm text-muted-foreground">
          Mobile-like modular structure for account, company, subscription, and preferences.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Profile information and personal identity details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={user?.role.name !== "OWNER"}
              />
              {user?.role.name !== "OWNER" && (
                <p className="text-xs text-muted-foreground">
                  Only owners can change phone number.
                </p>
              )}
            </div>
            <Button onClick={() => savePlaceholder("Profile")}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Login
            </CardTitle>
            <CardDescription>Password update and login safety controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">
                  Require an extra verification step for sign in.
                </p>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
            </div>
            <Button onClick={savePassword}>Update Security</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company
            </CardTitle>
            <CardDescription>Organization profile and ownership-level settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={user?.role.name !== "OWNER"}
              />
            </div>
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              Company ID: <span className="font-medium">{company?.id ?? "N/A"}</span>
            </div>
            <Button
              onClick={() => savePlaceholder("Company")}
              disabled={user?.role.name !== "OWNER"}
            >
              Save Company
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>
              Structured plan, status, cycle, and usage section (most detailed).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-center justify-between rounded-lg border p-3 ${statusMeta.style}`}>
              <div className="flex items-center gap-2">
                {statusMeta.icon}
                <span className="text-sm font-semibold">{statusMeta.label}</span>
              </div>
              <Badge variant="secondary">{subscription?.plan?.name ?? "No Plan"}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Current Period Start</p>
                <p className="text-sm font-semibold">
                  {subscription?.currentPeriodStart
                    ? formatDate(subscription.currentPeriodStart)
                    : "-"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Current Period End</p>
                <p className="text-sm font-semibold">
                  {subscription?.currentPeriodEnd
                    ? formatDate(subscription.currentPeriodEnd)
                    : subscription?.trialEndsAt
                      ? formatDate(subscription.trialEndsAt)
                      : "-"}
                </p>
              </div>
            </div>

            {typeof daysLeft === "number" && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                {daysLeft} days remaining in current cycle.
              </div>
            )}

            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Plan Features</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {subscription?.plan?.features?.filter((feature) => feature.enabled).length ? (
                  subscription?.plan?.features
                    ?.filter((feature) => feature.enabled)
                    .map((feature) => (
                      <li key={feature.feature}>- {feature.feature}</li>
                    ))
                ) : (
                  <li>- No feature metadata available</li>
                )}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline">Change Plan</Button>
              <Button variant="outline">Billing Instructions</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <Languages className="h-5 w-5" />
              Appearance & Language
            </CardTitle>
            <CardDescription>Display theme and interface language preferences.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium">Theme</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                >
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                >
                  Dark
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                >
                  System
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Language</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    type="button"
                    variant={language === lang.code ? "default" : "outline"}
                    onClick={() => {
                      setLanguage(lang.code);
                      toast({
                        title: "Language preference selected",
                        description: `${lang.label} will be applied once i18n wiring is connected.`,
                      });
                    }}
                  >
                    {lang.native}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
