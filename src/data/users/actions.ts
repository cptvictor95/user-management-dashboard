import type {
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  UserResponse,
  CreateUserResponse,
  UpdateUserResponse,
} from "./schemas";

const API_BASE_URL = "https://reqres.in/api";

// Helper function to get auth headers (client-side)
const getAuthHeaders = () => {
  // Get token from cookies
  let token = null;
  if (typeof window !== "undefined") {
    const nameEQ = "auth_token=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        token = c.substring(nameEQ.length, c.length);
        break;
      }
    }
  }

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

// Server actions for form submissions
export async function createUserAction(formData: FormData) {
  const email = formData.get("email") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  try {
    return await createUser({ email, first_name, last_name });
  } catch (error) {
    console.error("Create user action failed:", error);
    throw error;
  }
}

export async function updateUserAction(id: number, formData: FormData) {
  const email = formData.get("email") as string;
  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;

  try {
    return await updateUser(id, { email, first_name, last_name });
  } catch (error) {
    console.error("Update user action failed:", error);
    throw error;
  }
}

export async function deleteUserAction(id: number) {
  try {
    await deleteUser(id);
  } catch (error) {
    console.error("Delete user action failed:", error);
    throw error;
  }
}
