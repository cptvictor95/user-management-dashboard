import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../actions";
import type {
  UpdateUserRequest,
  User,
  UsersListResponse,
  UserResponse,
} from "../schemas";

// Hook for fetching users list with pagination
export const useUsers = (page: number = 1) => {
  return useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching single user
export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: (data, variables) => {
      // Optimistically add the new user to local state
      // Since the API doesn't return a full user object, we'll simulate it
      const newUser: User = {
        id: data.id,
        email: variables.email,
        first_name: variables.first_name,
        last_name: variables.last_name,
        avatar: `https://reqres.in/img/faces/${data.id}-image.jpg`, // Default avatar
      };

      // Update all users queries to include the new user
      queryClient.setQueriesData(
        { queryKey: ["users"] },
        (oldData: UsersListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: [newUser, ...oldData.data.slice(0, 5)], // Add to beginning, keep only 6 items
            total: oldData.total + 1,
          };
        }
      );

      // Invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      console.error("Create user failed:", error);
    },
  });
};

// Hook for updating user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: number;
      userData: UpdateUserRequest;
    }) => updateUser(id, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        ["user", variables.id],
        (oldData: UserResponse | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: {
              ...oldData.data,
              email: variables.userData.email,
              first_name: variables.userData.first_name,
              last_name: variables.userData.last_name,
            },
          };
        }
      );

      // Update the user in all users lists
      queryClient.setQueriesData(
        { queryKey: ["users"] },
        (oldData: UsersListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((user: User) =>
              user.id === variables.id
                ? {
                    ...user,
                    email: variables.userData.email,
                    first_name: variables.userData.first_name,
                    last_name: variables.userData.last_name,
                  }
                : user
            ),
          };
        }
      );
    },
    onError: (error) => {
      console.error("Update user failed:", error);
    },
  });
};

// Hook for deleting user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (data, variables) => {
      // Remove the user from all users lists
      queryClient.setQueriesData(
        { queryKey: ["users"] },
        (oldData: UsersListResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.filter((user: User) => user.id !== variables),
            total: oldData.total - 1,
          };
        }
      );

      // Remove the specific user query
      queryClient.removeQueries({ queryKey: ["user", variables] });
    },
    onError: (error) => {
      console.error("Delete user failed:", error);
    },
  });
};

// Custom hook for pagination state
export const usePagination = (initialPage: number = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
  };
};
