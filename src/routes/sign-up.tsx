import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SignUpProps {
  heading?: string;
  signupText?: string;
  loginText?: string;
  loginUrl?: string;
}

const SignUp = ({
  heading = "Sign Up",
  signupText = "Create account",
  loginText = "Already have an account?",
  loginUrl = "/sign-in",
}: SignUpProps) => {
  return (
    <section className="h-[calc(100vh-4rem)] bg-muted">
      <div className="flex h-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md">
          {heading && <h1 className="text-2xl font-semibold">{heading}</h1>}
          <div className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Email"
                  required
                  className="bg-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  type="password"
                  placeholder="Password"
                  required
                  className="bg-white"
                />
              </div>
              <Button type="submit" className="mt-2 w-full">
                {signupText}
              </Button>
            </div>
          </div>
          <div className="flex justify-center gap-1 text-sm text-muted-foreground">
            <p>{loginText}</p>
            <Link
              to={loginUrl}
              className="font-medium text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Route = createFileRoute("/sign-up")({
  component: SignUp,
});
