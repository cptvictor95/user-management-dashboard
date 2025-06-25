import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/data/auth/hooks";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard = ({
  children,
  requireAuth = true,
  redirectTo,
}: AuthGuardProps) => {
  const { data: auth, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !auth?.isAuthenticated) {
      // Redirect to sign-in if authentication is required but user is not authenticated
      router.navigate({ to: redirectTo || "/sign-in" });
    } else if (!requireAuth && auth?.isAuthenticated) {
      // Redirect to home if user is authenticated but trying to access auth pages
      router.navigate({ to: redirectTo || "/" });
    }
  }, [auth?.isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render children until auth check is complete
  if (requireAuth && !auth?.isAuthenticated) {
    return null;
  }

  if (!requireAuth && auth?.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
