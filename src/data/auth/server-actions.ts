"use server";

import { cookies } from "next/headers";

interface AuthSession {
  token: string;
  email: string;
  profile?: {
    firstName: string;
    lastName: string;
  };
}

// Server action to save auth session
export async function saveAuthSession(session: AuthSession) {
  const cookieStore = await cookies();

  console.log("🖥️ Server: Saving auth session:", {
    email: session.email,
    hasToken: !!session.token,
    hasProfile: !!session.profile,
    timestamp: new Date().toISOString(),
  });

  // Set cookies with proper settings
  cookieStore.set("auth_token", session.token, {
    httpOnly: false, // Allow client access for API calls
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  cookieStore.set("user_email", session.email, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (session.profile) {
    cookieStore.set("user_profile", JSON.stringify(session.profile), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
}

// Server action to get auth session
export async function getAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value;
  const email = cookieStore.get("user_email")?.value;
  const profileCookie = cookieStore.get("user_profile")?.value;

  if (!token || !email) {
    return null;
  }

  let profile = null;
  if (profileCookie) {
    try {
      profile = JSON.parse(profileCookie);
    } catch (error) {
      console.error("Failed to parse profile cookie:", error);
    }
  }

  return {
    token,
    email,
    profile,
  };
}

// Server action to clear auth session
export async function clearAuthSession() {
  const cookieStore = await cookies();

  console.log("🖥️ Server: Clearing auth session");

  cookieStore.delete("auth_token");
  cookieStore.delete("user_email");
  cookieStore.delete("user_profile");
}

// Server action to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return !!session;
}
