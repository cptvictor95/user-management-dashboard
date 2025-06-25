import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const SignIn = () => {
  const signInMutation = useSignIn();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignInFormData) => {
    signInMutation.mutate(data);
  };

  return (
    <AuthGuard requireAuth={false}>
      <section className="h-screen bg-muted">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md">
            <h1 className="text-2xl font-semibold">Sign In</h1>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
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
                          className="bg-white"
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
                          className="bg-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>

                {signInMutation.isError && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    {signInMutation.error?.message || "Failed to sign in"}
                  </p>
                )}
              </form>
            </Form>

            <div className="flex justify-center gap-1 text-sm text-muted-foreground">
              <p>Don't have an account?</p>
              <Link
                to="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
};

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
});
