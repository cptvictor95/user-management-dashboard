// Client-side token management using cookies (compatible with SSR)

// Helper function to set cookies from client-side
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    document.cookie = cookieString;
    console.log("Setting cookie:", {
      name,
      value: value.substring(0, 10) + "...",
      cookieString,
    });
  }
};

// Helper function to get cookies from client-side
const getCookie = (name: string): string | null => {
  if (typeof window !== "undefined") {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        console.log("Getting cookie:", {
          name,
          value: value ? value.substring(0, 10) + "..." : "null",
        });
        return value;
      }
    }
    console.log("Cookie not found:", { name, allCookies: document.cookie });
  }
  return null;
};

// Helper function to delete cookies from client-side
const deleteCookie = (name: string): void => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const saveToken = (token: string): void => {
  setCookie("auth_token", token);
};

export const getToken = (): string | null => {
  return getCookie("auth_token");
};

export const saveUserEmail = (email: string): void => {
  setCookie("user_email", email);
};

export const getUserEmail = (): string | null => {
  return getCookie("user_email");
};

export const saveUserProfile = (profile: {
  firstName: string;
  lastName: string;
}): void => {
  setCookie("user_profile", JSON.stringify(profile));
};

export const getUserProfile = (): {
  firstName: string;
  lastName: string;
} | null => {
  const profile = getCookie("user_profile");
  if (!profile) return null;

  try {
    // Decode URL-encoded data before parsing JSON
    const decodedProfile = decodeURIComponent(profile);
    return JSON.parse(decodedProfile);
  } catch (error) {
    console.error(
      "Failed to parse user profile cookie:",
      error,
      "Raw cookie:",
      profile
    );
    return null;
  }
};

export const removeToken = (): void => {
  deleteCookie("auth_token");
  deleteCookie("user_email");
  deleteCookie("user_profile");
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
