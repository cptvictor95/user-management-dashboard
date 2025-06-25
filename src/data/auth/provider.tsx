"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getToken,
  getUserEmail,
  getUserProfile,
  isAuthenticated,
} from "./utils";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
  profile: { firstName: string; lastName: string } | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  email: null,
  profile: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
  initialAuth?: {
    token: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  } | null;
}

export const AuthProvider = ({ children, initialAuth }: AuthProviderProps) => {
  // Initialize with server-side auth if available
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: !!initialAuth,
    token: initialAuth?.token || null,
    email: initialAuth?.email || null,
    profile: initialAuth?.profile || null,
    isLoading: !initialAuth, // If we have initialAuth, we're not loading
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);

    console.log("🔐 AuthProvider mounted with initial auth:", {
      hasInitialAuth: !!initialAuth,
      initialAuthEmail: initialAuth?.email,
      timestamp: new Date().toISOString(),
    });

    // If we already have initial auth from server, don't overwrite it
    if (initialAuth) {
      console.log("🔐 Using server-side auth state");
      return;
    }

    // Check authentication state on client side only if no server auth
    const token = getToken();
    const email = getUserEmail();
    const profile = getUserProfile();
    const authenticated = isAuthenticated();

    console.log("🔐 AuthProvider client-side fallback state:", {
      token: token ? token.substring(0, 10) + "..." : null,
      email,
      profile,
      authenticated,
      timestamp: new Date().toISOString(),
    });

    setAuthState({
      isAuthenticated: authenticated,
      token,
      email,
      profile,
      isLoading: false,
    });

    // Only set up polling if we don't have initial auth from server
    if (!initialAuth) {
      // Set up a listener for cookie changes (using a simple polling mechanism)
      const checkAuthChanges = () => {
        const newToken = getToken();
        const newEmail = getUserEmail();
        const newProfile = getUserProfile();
        const newAuthenticated = isAuthenticated();

        setAuthState((prevState) => {
          if (
            prevState.isAuthenticated !== newAuthenticated ||
            prevState.token !== newToken ||
            prevState.email !== newEmail ||
            JSON.stringify(prevState.profile) !== JSON.stringify(newProfile)
          ) {
            console.log("🔐 AuthProvider state change detected:", {
              old: {
                isAuthenticated: prevState.isAuthenticated,
                hasToken: !!prevState.token,
                email: prevState.email,
              },
              new: {
                isAuthenticated: newAuthenticated,
                hasToken: !!newToken,
                email: newEmail,
              },
              timestamp: new Date().toISOString(),
            });

            return {
              isAuthenticated: newAuthenticated,
              token: newToken,
              email: newEmail,
              profile: newProfile,
              isLoading: false,
            };
          }
          return prevState;
        });
      };

      // Check for auth changes less frequently to avoid infinite loops
      const interval = setInterval(checkAuthChanges, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [initialAuth]);

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
};

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const Providers = ({
  children,
  initialAuth,
}: {
  children: React.ReactNode;
  initialAuth?: {
    token: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  } | null;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialAuth={initialAuth}>{children}</AuthProvider>
    </QueryClientProvider>
  );
};
