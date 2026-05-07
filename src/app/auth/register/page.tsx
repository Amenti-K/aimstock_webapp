"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useSignUp } from "@/api/auth/api.auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import TextField from "@/components/forms/fields/TextField";
import { SignUpInput, signUpSchema } from "@/components/schema/auth.schema";
import { useLanguage } from "@/hooks/language.hook";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { mutate: signUp, isPending } = useSignUp();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      companyName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  const onSubmit = (data: SignUpInput) => {
    signUp(data);
  };

  return (
    <div className="flex flex-col space-y-6 pr-2 pb-12">
      <div className="flex flex-col space-y-2 text-center lg:text-left mt-4 lg:mt-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("auth.register.createAccount")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("auth.register.registerPrompt")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            control={form.control as any}
            name="name"
            label={t("auth.form.fullName")}
            placeholder={t("auth.form.fullNamePlaceholder")}
            disabled={isPending}
          />

          <TextField
            control={form.control as any}
            name="companyName"
            label={t("auth.form.companyName")}
            placeholder={t("auth.form.companyNamePlaceholder")}
            disabled={isPending}
          />

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
            placeholder={t("auth.form.passwordPlaceholder")}
            secureTextEntry={true}
            disabled={isPending}
          />

          <TextField
            control={form.control as any}
            name="confirmPassword"
            label={t("auth.form.confirmPassword")}
            placeholder={t("auth.form.confirmPasswordPlaceholder")}
            secureTextEntry={true}
            disabled={isPending}
          />

          <FormField
            control={form.control as any}
            name="acceptedTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    {t("auth.register.agreeTo")}{" "}
                    <Link
                      href="https://aimstock.aimtechgroups.com/terms"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("auth.register.terms")}
                    </Link>{" "}
                    {t("auth.register.and")}{" "}
                    <Link
                      href="https://aimstock.aimtechgroups.com/privacy"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("auth.register.privacy")}
                    </Link>
                    {t("auth.register.agreeSuffix")}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("auth.register.signingUp")}
              </>
            ) : (
              t("auth.register.signUp")
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm pb-8">
        <span className="text-muted-foreground">
          {t("auth.register.alreadyHaveAccount")}{" "}
        </span>
        <Link
          href="/auth/login"
          className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          {t("auth.register.signIn")}
        </Link>
      </div>
    </div>
  );
}
