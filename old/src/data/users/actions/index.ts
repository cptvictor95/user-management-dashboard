import { getToken } from "../../auth/utils";
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  UserResponse,
  CreateUserResponse,
  UpdateUserResponse,
} from "../schemas";

const API_BASE_URL = "https://reqres.in/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "x-api-key": "reqres-free-v1",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get users list with pagination
export const getUsers = async (
  page: number = 1
): Promise<UsersListResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/users?page=${page}&per_page=6`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// Get single user
export const getUser = async (id: number): Promise<UserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

// Create new user
export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to create user" }));
    throw new Error(errorData.error || "Failed to create user");
  }

  return response.json();
};

// Update user
export const updateUser = async (
  id: number,
  userData: UpdateUserRequest
): Promise<UpdateUserResponse> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Failed to update user" }));
    throw new Error(errorData.error || "Failed to update user");
  }

  return response.json();
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};

// Find user by email address
export const findUserByEmail = async (
  email: string
): Promise<UserResponse | null> => {
  try {
    // ReqRes API has limited users, so we'll check first few pages
    for (let page = 1; page <= 2; page++) {
      const usersResponse = await getUsers(page);
      const user = usersResponse.data.find((user) => user.email === email);

      if (user) {
        // Return in the same format as getUser
        return { data: user };
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to find user by email:", error);
    return null;
  }
};
