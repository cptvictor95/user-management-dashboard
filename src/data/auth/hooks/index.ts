import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { signUpUser, signInUser } from "../actions";
import { findUserByEmail } from "../../users/actions";
import {
  saveToken,
  removeToken,
  getToken,
  isAuthenticated,
  saveUserEmail,
  getUserEmail,
  saveUserProfile,
  getUserProfile,
} from "../utils";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: () => ({
      isAuthenticated: isAuthenticated(),
      token: getToken(),
      email: getUserEmail(),
      profile: getUserProfile(),
    }),
    staleTime: Infinity,
  });
};

export const useSignUp = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: async (data, variables) => {
      saveToken(data.token);
      saveUserEmail(variables.email);

      // Fetch user profile data by finding the user with the matching email
      try {
        const userResponse = await findUserByEmail(variables.email);
        if (userResponse) {
          const profile = {
            firstName: userResponse.data.first_name,
            lastName: userResponse.data.last_name,
          };
          saveUserProfile(profile);

          queryClient.setQueryData(["auth"], {
            isAuthenticated: true,
            token: data.token,
            email: variables.email,
            profile,
          });
        } else {
          // User not found in the system
          queryClient.setQueryData(["auth"], {
            isAuthenticated: true,
            token: data.token,
            email: variables.email,
            profile: null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback without profile data
        queryClient.setQueryData(["auth"], {
          isAuthenticated: true,
          token: data.token,
          email: variables.email,
          profile: null,
        });
      }

      router.navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
    },
  });
};

export const useSignIn = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: signInUser,
    onSuccess: async (data, variables) => {
      saveToken(data.token);
      saveUserEmail(variables.email);

      // Fetch user profile data by finding the user with the matching email
      try {
        const userResponse = await findUserByEmail(variables.email);
        if (userResponse) {
          const profile = {
            firstName: userResponse.data.first_name,
            lastName: userResponse.data.last_name,
          };
          saveUserProfile(profile);

          queryClient.setQueryData(["auth"], {
            isAuthenticated: true,
            token: data.token,
            email: variables.email,
            profile,
          });
        } else {
          // User not found in the system
          queryClient.setQueryData(["auth"], {
            isAuthenticated: true,
            token: data.token,
            email: variables.email,
            profile: null,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback without profile data
        queryClient.setQueryData(["auth"], {
          isAuthenticated: true,
          token: data.token,
          email: variables.email,
          profile: null,
        });
      }

      router.navigate({ to: "/" });
    },
    onError: (error) => {
      console.error("Sign in failed:", error);
    },
  });
};

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      removeToken();
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth"], {
        isAuthenticated: false,
        token: null,
        email: null,
        profile: null,
      });

      router.navigate({ to: "/sign-in" });
    },
  });
};
