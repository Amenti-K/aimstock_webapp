"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useSignIn } from "@/api/auth/api.auth";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import TextField from "@/components/forms/fields/TextField";
import { SignInInput, signInSchema } from "@/components/schema/auth.schema";
import { useLanguage } from "@/hooks/language.hook";

export default function LoginPage() {
  const { mutate: signIn, isPending } = useSignIn();
  const { t } = useLanguage();

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInInput) => {
    signIn(data);
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("auth.login.welcomeBack")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.login.signInPrompt")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <TextField
            control={form.control as any}
            name="phoneNumber"
            label={t("auth.form.phoneNumber")}
            placeholder={t("auth.form.phonePlaceholder")}
            type="tel"
            disabled={isPending}
          />

          <TextField
            control={form.control as any}
            name="password"
            label={t("auth.form.password")}
            placeholder={t("auth.form.loginPasswordPlaceholder")}
            secureTextEntry={true}
            disabled={isPending}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("auth.login.signingIn")}
              </>
            ) : (
              t("auth.login.signIn")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t("auth.login.newHere")}{" "}
        </span>
        <Link
          href="/auth/register"
          className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {t("auth.login.createAccount")}
        </Link>
      </div>
    </div>
  );
}
