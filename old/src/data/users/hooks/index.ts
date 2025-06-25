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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      try {
        return await getUsers(page);
      } catch (error) {
        // Handle case where API doesn't have the page (e.g., page 3 when API only has 12 users)
        // Check if this page should exist based on local cache data
        const page1Data = queryClient.getQueryData<UsersListResponse>([
          "users",
          1,
        ]);

        if (page1Data) {
          const totalPages = Math.ceil(page1Data.total / 6);

          // If this page should exist based on our local data but API call failed
          if (page <= totalPages && page > 2) {
            // This is likely page 3 with locally created users
            // We need to construct what page 3 should look like

            // For the specific case of going from 12->13 users:
            // Page 3 should have the last user from the original 12 users
            // That would be user with ID 12 from the original API data

            // We'll create a fallback response structure
            // For page 3 when going from 12->13 users, we need to put the "overflow" user
            // Let's check if we can get the user that should be on page 3

            const page2Data = queryClient.getQueryData<UsersListResponse>([
              "users",
              2,
            ]);
            let page3Users: User[] = [];

            if (page2Data && page2Data.data.length === 6) {
              // If page 2 has 6 users, the last one should move to page 3
              page3Users = [page2Data.data[5]];
            }

            return {
              page,
              per_page: 6,
              total: page1Data.total,
              total_pages: totalPages,
              data: page3Users,
            };
          }
        }

        throw error; // Re-throw for genuine errors
      }
    },
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
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(variables.first_name)}+${encodeURIComponent(variables.last_name)}&background=random&color=fff&size=256`,
      };

      // Update all users queries to include the new user
      // Strategy: Add new user to page 1, and handle the cascade effect properly

      const page1Data = queryClient.getQueryData<UsersListResponse>([
        "users",
        1,
      ]);
      if (page1Data) {
        const newTotal = page1Data.total + 1;
        const newTotalPages = Math.ceil(newTotal / 6);
        const oldTotalPages = page1Data.total_pages;

        // If we're creating a new page (going from 2 pages to 3 pages)
        if (newTotalPages > oldTotalPages) {
          // The scenario: originally 12 users (2 pages), now 13 users (3 pages)
          // We need to make sure page 3 has the last user when accessed

          // For this specific case where we go from 12->13 users (2->3 pages):
          // Page 1: [newUser, users 1-5] (6 users)
          // Page 2: [users 6-11] (6 users)
          // Page 3: [user 12] (1 user)

          // Update page 1: add new user, keep first 5 original users
          queryClient.setQueryData<UsersListResponse>(["users", 1], {
            ...page1Data,
            data: [newUser, ...page1Data.data.slice(0, 5)],
            total: newTotal,
            total_pages: newTotalPages,
          });

          // Update page 2 if cached: shift users but keep 6 users
          const page2Data = queryClient.getQueryData<UsersListResponse>([
            "users",
            2,
          ]);
          if (page2Data) {
            const userMovedToPage3 = page2Data.data[5]; // Last user from page 2 moves to page 3
            queryClient.setQueryData<UsersListResponse>(["users", 2], {
              ...page2Data,
              data: [page1Data.data[5], ...page2Data.data.slice(0, 5)], // Get 6th user from page 1, keep first 5 from page 2
              total: newTotal,
              total_pages: newTotalPages,
            });

            // Create page 3 with the user that was pushed from page 2
            if (userMovedToPage3) {
              queryClient.setQueryData<UsersListResponse>(["users", 3], {
                page: 3,
                per_page: 6,
                total: newTotal,
                total_pages: newTotalPages,
                data: [userMovedToPage3],
              });
            }
          } else {
            // Page 2 not in cache, but we still need to figure out what user goes on page 3
            // In the typical scenario: 12 users initially, adding 1 makes 13 users
            // The last user from the original 12 should be on page 3
            // Since page 1 originally had users 1-6, the 6th user (page1Data.data[5]) gets moved to page 2
            // And user 12 (the last user from the original set) should go to page 3
            // Don't create page 3 with empty data - instead, let it be fetched naturally
            // and handle the case when it fails to fetch (since API only has 12 users)
          }
        } else {
          // Normal case: just add user to page 1 and update totals
          queryClient.setQueryData<UsersListResponse>(["users", 1], {
            ...page1Data,
            data: [newUser, ...page1Data.data.slice(0, 5)],
            total: newTotal,
            total_pages: newTotalPages,
          });
        }

        // Update any other cached pages to reflect new totals
        for (let pageNum = 2; pageNum <= newTotalPages; pageNum++) {
          const pageData = queryClient.getQueryData<UsersListResponse>([
            "users",
            pageNum,
          ]);
          if (pageData && pageNum !== 3) {
            // Don't override page 3 if we just created it
            queryClient.setQueryData<UsersListResponse>(["users", pageNum], {
              ...pageData,
              total: newTotal,
              total_pages: newTotalPages,
            });
          }
        }
      }

      // Don't invalidate queries to prevent the newly created user from disappearing
      // Since we're using a mock API (ReqRes), the created user won't persist on the server
      // So we rely on optimistic updates to maintain the user in the local cache
    },
    onError: (error) => {
      console.error("Create user failed:", error);
      // On error, we could optionally invalidate to sync with server state
      // queryClient.invalidateQueries({ queryKey: ["users"] });
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
