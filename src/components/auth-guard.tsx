"use client";

import { useAuth } from "@/data/auth/provider";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Since middleware handles all redirects, we can trust that if we reach this point,
  // the user should have access to the page. However, we still check for edge cases
  // during the brief moment before potential redirects take effect.

  if (requireAuth && !isAuthenticated) {
    // This should rarely be seen since middleware redirects unauthenticated users
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting to sign-in...</div>
      </div>
    );
  }

  if (!requireAuth && isAuthenticated) {
    // This should rarely be seen since middleware redirects authenticated users away from auth pages
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting to dashboard...</div>
      </div>
    );
  }

  // Render children - middleware ensures we only reach this point when appropriate
  return <>{children}</>;
};
