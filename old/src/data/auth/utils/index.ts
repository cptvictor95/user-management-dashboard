export const saveToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const getToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const saveUserEmail = (email: string): void => {
  localStorage.setItem("user_email", email);
};

export const getUserEmail = (): string | null => {
  return localStorage.getItem("user_email");
};

export const saveUserProfile = (profile: {
  firstName: string;
  lastName: string;
}): void => {
  localStorage.setItem("user_profile", JSON.stringify(profile));
};

export const getUserProfile = (): {
  firstName: string;
  lastName: string;
} | null => {
  const profile = localStorage.getItem("user_profile");
  return profile ? JSON.parse(profile) : null;
};

export const removeToken = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_profile");
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
