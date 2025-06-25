import { cookies } from "next/headers";

// Server-side token management using cookies (readable by both client and server)
export const saveToken = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
};

export const getToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};

export const saveUserEmail = async (email: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("user_email", email, {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
};

export const getUserEmail = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("user_email")?.value || null;
};

export const saveUserProfile = async (profile: {
  firstName: string;
  lastName: string;
}): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set("user_profile", JSON.stringify(profile), {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
};

export const getUserProfile = async (): Promise<{
  firstName: string;
  lastName: string;
} | null> => {
  const cookieStore = await cookies();
  const profile = cookieStore.get("user_profile")?.value;
  return profile ? JSON.parse(profile) : null;
};

export const removeToken = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_email");
  cookieStore.delete("user_profile");
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return token !== null;
};
