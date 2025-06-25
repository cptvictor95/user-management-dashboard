import { z } from "zod";

// User data schema (from API response)
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  avatar: z.string().url(),
});

// Create user form schema
export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

// Update user form schema
export const updateUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

// API request schemas
export const createUserRequestSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
});

export const updateUserRequestSchema = z.object({
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
});

// API response schemas
export const usersListResponseSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  data: z.array(userSchema),
});

export const userResponseSchema = z.object({
  data: userSchema,
});

export const createUserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  createdAt: z.string(),
});

export const updateUserResponseSchema = z.object({
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  updatedAt: z.string(),
});

// Type exports
export type User = z.infer<typeof userSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;
