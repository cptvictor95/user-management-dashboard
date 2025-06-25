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

  // If auth is required but user is not authenticated, show loading
  // (middleware will handle the actual redirect)
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // If auth is not required but user is authenticated, show loading
  // (middleware will handle the actual redirect)
  if (!requireAuth && isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  // Render children if auth state matches requirements
  return <>{children}</>;
};
