import type { SignUpRequest, SignInRequest, AuthResponse } from "../schemas";

const API_BASE_URL = "https://reqres.in/api";

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
