"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../actions";
import type { UpdateUserRequest, User } from "../schemas";
import { QUERY_KEYS, CACHE_TIME } from "../constants";
import {
  optimisticallyAddUser,
  optimisticallyUpdateUser,
  optimisticallyRemoveUser,
} from "../cache-utils";

// Hook for fetching users list with pagination
export const useUsers = (page: number = 1) => {
  return useQuery({
    queryKey: QUERY_KEYS.users(page),
    queryFn: () => getUsers(page),
    staleTime: CACHE_TIME.staleTime,
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
  });
};

// Hook for fetching single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.user(id),
    queryFn: () => getUser(id),
    enabled: !!id,
    staleTime: CACHE_TIME.staleTime,
  });
};

// Hook for creating user with simplified optimistic updates
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data, variables) => {
      // Create optimistic user object
      const newUser: User = {
        id: data.id,
        email: variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          variables.first_name
        )}+${encodeURIComponent(
          variables.last_name
        )}&background=random&color=fff&size=256`,
      };

      // Use simplified cache utility
      optimisticallyAddUser(queryClient, newUser);
    },
    onError: (error) => {
      console.error("Create user failed:", error);
    },
  });
};

// Hook for updating user with simplified cache management
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...userData }: { id: number } & UpdateUserRequest) =>
      updateUser(id, userData),
    onSuccess: (data, { id, ...userData }) => {
      // Use simplified cache utility
      optimisticallyUpdateUser(queryClient, id, userData);
    },
    onError: (error) => {
      console.error("Update user failed:", error);
    },
  });
};

// Hook for deleting user with simplified cache management
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedUserId) => {
      // Use simplified cache utility - invalidates all user queries for consistency
      optimisticallyRemoveUser(queryClient, deletedUserId);
    },
    onError: (error) => {
      console.error("Delete user failed:", error);
    },
  });
};
