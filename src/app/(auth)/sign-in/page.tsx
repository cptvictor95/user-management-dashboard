"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";

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

import { signInSchema, type SignInFormData } from "@/data/auth/schemas";
import { useSignIn } from "@/data/auth/hooks";
import { AuthGuard } from "@/components/auth-guard";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const signInMutation = useSignIn();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    console.log("📝 Sign-in form submitted:", {
      email: data.email,
      hasPassword: !!data.password,
      timestamp: new Date().toISOString(),
    });

    setError(null);

    signInMutation.mutate(data, {
      onError: (err) => {
        console.error("📝 Sign-in form error:", err);
        setError(err instanceof Error ? err.message : "Failed to sign in");
      },
    });
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm">
              Welcome! Please enter your details to continue.
            </p>
            <p className="mt-2 text-sm">
              If you just wanna test the app, you can use the following email
              and password:
            </p>
            <p className="mt-2 text-sm">Email: eve.holt@reqres.in</p>
            <p className="mt-2 text-sm">Password: pistol</p>
          </div>

          <div className="py-8 px-6 shadow-sm rounded-lg border">
            <h1 className="sr-only">Sign In</h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="h-11"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-8 h-11 font-medium"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}
              </form>
            </Form>
          </div>

          <div className="text-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
