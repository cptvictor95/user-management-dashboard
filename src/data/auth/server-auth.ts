import { cookies } from "next/headers";

// Server-side auth utilities for SSR
export async function getServerAuth() {
  const cookieStore = await cookies();

  const token = cookieStore.get("auth_token")?.value || null;
  const email = cookieStore.get("user_email")?.value || null;
  const profileCookie = cookieStore.get("user_profile")?.value;

  let profile = null;
  if (profileCookie) {
    try {
      profile = JSON.parse(profileCookie);
    } catch (error) {
      console.error("Failed to parse user profile:", error);
    }
  }

  return {
    isAuthenticated: !!token,
    token,
    email,
    profile,
  };
}
