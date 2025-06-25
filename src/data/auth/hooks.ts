"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUpUser, signInUser, findUserByEmail } from "./actions";
import { saveAuthSession, clearAuthSession } from "./server-actions";

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: async (data, variables) => {
      // Fetch user profile data by finding the user with the matching email
      let profile = null;
      try {
        const userResponse = await findUserByEmail(variables.email);
        if (userResponse) {
          profile = {
            firstName: userResponse.data.first_name,
            lastName: userResponse.data.last_name,
          };
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }

      // Save session using server action
      await saveAuthSession({
        token: data.token,
        email: variables.email,
        profile: profile || undefined,
      });

      // Clear cache and force a page reload to trigger middleware
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInUser,
    onSuccess: async (data, variables) => {
      console.log("🚀 Sign in success:", {
        token: data.token ? data.token.substring(0, 10) + "..." : null,
        email: variables.email,
        timestamp: new Date().toISOString(),
      });

      // Fetch user profile data by finding the user with the matching email
      let profile = null;
      try {
        console.log("👤 Fetching user profile for:", variables.email);
        const userResponse = await findUserByEmail(variables.email);
        if (userResponse) {
          profile = {
            firstName: userResponse.data.first_name,
            lastName: userResponse.data.last_name,
          };
          console.log("👤 Profile found:", profile);
        } else {
          console.log("👤 No profile found for user");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }

      // Save session using server action
      console.log("🖥️ Saving session on server");
      await saveAuthSession({
        token: data.token,
        email: variables.email,
        profile: profile || undefined,
      });

      console.log("🔄 About to clear cache and redirect");
      // Clear cache and force a page reload to trigger middleware
      queryClient.clear();

      // Redirect to dashboard
      console.log("🔄 Redirecting to dashboard");
      window.location.href = "/";
    },
    onError: (error) => {
      console.error("🚨 Sign in failed:", error);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearAuthSession();
    },
    onSuccess: () => {
      // Clear all cache when signing out
      queryClient.clear();

      // Force page reload to trigger middleware
      window.location.href = "/sign-in";
    },
  });
};
