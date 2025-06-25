"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SignUpRequest, SignInRequest, AuthResponse } from "./schemas";
import type { User } from "../users/schemas";
import {
  saveToken,
  saveUserEmail,
  saveUserProfile,
  removeToken,
} from "./utils-server";

const API_BASE_URL = "https://reqres.in/api";

// Helper function to find user by email (to avoid circular dependency)
const findUserByEmailServer = async (email: string) => {
  try {
    // ReqRes API has limited users, so we'll check first few pages
    for (let page = 1; page <= 2; page++) {
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&per_page=6`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "reqres-free-v1",
          },
        }
      );

      if (response.ok) {
        const usersResponse = await response.json();
        const user = usersResponse.data.find(
          (user: User) => user.email === email
        );

        if (user) {
          // Return in the same format as getUser
          return { data: user };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    return null;
  }
};

export const signUpUser = async (
  userData: SignUpRequest
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "reqres-free-v1",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to sign up" }));
    throw new Error(errorData.error || "Failed to sign up");
  }

  return response.json();
};

export const signInUser = async (
  userData: SignInRequest
): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "reqres-free-v1",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to sign in" }));
    throw new Error(errorData.error || "Failed to sign in");
  }

  return response.json();
};

// Export the client-side version of findUserByEmail for hooks
export const findUserByEmail = async (email: string) => {
  try {
    // ReqRes API has limited users, so we'll check first few pages
    for (let page = 1; page <= 2; page++) {
      const response = await fetch(
        `${API_BASE_URL}/users?page=${page}&per_page=6`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "reqres-free-v1",
          },
        }
      );

      if (response.ok) {
        const usersResponse = await response.json();
        const user = usersResponse.data.find(
          (user: User) => user.email === email
        );

        if (user) {
          // Return in the same format as getUser
          return { data: user };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    return null;
  }
};

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const data = await signUpUser({ email, password });

    await saveToken(data.token);
    await saveUserEmail(email);

    // Try to fetch user profile data
    try {
      const userResponse = await findUserByEmailServer(email);
      if (userResponse) {
        const profile = {
          firstName: userResponse.data.first_name,
          lastName: userResponse.data.last_name,
        };
        await saveUserProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Sign up failed:", error);
    throw error;
  }
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const data = await signInUser({ email, password });

    await saveToken(data.token);
    await saveUserEmail(email);

    // Try to fetch user profile data
    try {
      const userResponse = await findUserByEmailServer(email);
      if (userResponse) {
        const profile = {
          firstName: userResponse.data.first_name,
          lastName: userResponse.data.last_name,
        };
        await saveUserProfile(profile);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }

    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.error("Sign in failed:", error);
    throw error;
  }
}

export async function signOutAction() {
  try {
    await removeToken();
    revalidatePath("/");
    redirect("/sign-in");
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}
