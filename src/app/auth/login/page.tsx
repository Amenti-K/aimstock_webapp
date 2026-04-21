"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useSignIn } from "@/api/auth/api.auth";
import {
  appSignInSchema,
  AppSignInInput,
} from "@/components/schema/user-auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const { mutate: signIn, isPending } = useSignIn();

  const form = useForm<AppSignInInput>({
    resolver: zodResolver(appSignInSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (data: AppSignInInput) => {
    signIn(data);
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your phone number and password to sign in
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 0912345678"
                    type="tel"
                    className="h-11"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                {/* <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm font-medium text-primary hover:underline hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div> */}
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    className="h-11"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">New here? </span>
        <Link
          href="/auth/register"
          className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
