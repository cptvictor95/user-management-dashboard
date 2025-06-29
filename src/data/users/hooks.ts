"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "./actions";
import type {
  UpdateUserRequest,
  User,
  UsersListResponse,
  UserResponse,
} from "./schemas";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Hook for fetching users list with pagination
export const useUsers = (page: number = 1) => {
  return useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading new page
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
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          variables.first_name
        )}+${encodeURIComponent(
          variables.last_name
        )}&background=random&color=fff&size=256`,
      };

      // Get page 1 data to update
      const page1Data = queryClient.getQueryData<UsersListResponse>([
        "users",
        1,
      ]);
      if (page1Data) {
        const newTotal = page1Data.total + 1;
        const newTotalPages = Math.ceil(newTotal / 6);

        // Add new user to the beginning of page 1, remove the last user if page is full
        const updatedUsers = [newUser, ...page1Data.data];
        const page1Users = updatedUsers.slice(0, 6); // Keep only first 6 users on page 1
        const overflowUser = updatedUsers.length > 6 ? updatedUsers[6] : null;

        // Update page 1 with new user
        queryClient.setQueryData<UsersListResponse>(["users", 1], {
          ...page1Data,
          data: page1Users,
          total: newTotal,
          total_pages: newTotalPages,
        });

        // If there's an overflow user and we need to update page 2
        if (overflowUser) {
          const page2Data = queryClient.getQueryData<UsersListResponse>([
            "users",
            2,
          ]);
          if (page2Data) {
            // Add overflow user to beginning of page 2, remove last user if needed
            const updatedPage2Users = [overflowUser, ...page2Data.data];
            const page2Users = updatedPage2Users.slice(0, 6);
            const page2OverflowUser =
              updatedPage2Users.length > 6 ? updatedPage2Users[6] : null;

            queryClient.setQueryData<UsersListResponse>(["users", 2], {
              ...page2Data,
              data: page2Users,
              total: newTotal,
              total_pages: newTotalPages,
            });

            // Handle page 3 if needed
            if (page2OverflowUser && newTotalPages > 2) {
              const page3Data = queryClient.getQueryData<UsersListResponse>([
                "users",
                3,
              ]);
              if (page3Data) {
                const updatedPage3Users = [
                  page2OverflowUser,
                  ...page3Data.data,
                ];
                queryClient.setQueryData<UsersListResponse>(["users", 3], {
                  ...page3Data,
                  data: updatedPage3Users.slice(0, 6),
                  total: newTotal,
                  total_pages: newTotalPages,
                });
              } else {
                // Create page 3 if it doesn't exist
                queryClient.setQueryData<UsersListResponse>(["users", 3], {
                  page: 3,
                  per_page: 6,
                  total: newTotal,
                  total_pages: newTotalPages,
                  data: [page2OverflowUser],
                });
              }
            }
          }
        }

        // Update total_pages for any other cached pages
        for (let pageNum = 2; pageNum <= newTotalPages; pageNum++) {
          const pageData = queryClient.getQueryData<UsersListResponse>([
            "users",
            pageNum,
          ]);
          if (pageData) {
            queryClient.setQueryData<UsersListResponse>(["users", pageNum], {
              ...pageData,
              total: newTotal,
              total_pages: newTotalPages,
            });
          }
        }
      }
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
    mutationFn: ({ id, ...userData }: { id: number } & UpdateUserRequest) =>
      updateUser(id, userData),
    onSuccess: (data, { id, ...userData }) => {
      // Update the user in the cache optimistically
      // Find the user in all cached pages and update it
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({
        queryKey: ["users"],
        type: "active",
      });

      queries.forEach((query) => {
        if (
          query.queryKey[0] === "users" &&
          typeof query.queryKey[1] === "number"
        ) {
          const usersData = query.state.data as UsersListResponse | undefined;
          if (usersData) {
            const updatedData = {
              ...usersData,
              data: usersData.data.map((user) =>
                user.id === id
                  ? {
                      ...user,
                      email: userData.email,
                      first_name: userData.first_name,
                      last_name: userData.last_name,
                    }
                  : user
              ),
            };
            queryClient.setQueryData(query.queryKey, updatedData);
          }
        }
      });

      // Also update individual user query if cached
      queryClient.setQueryData(
        ["user", id],
        (oldData: UserResponse | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
              },
            };
          }
          return oldData;
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
    onSuccess: (_, deletedUserId) => {
      // Collect all users from all cached pages
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({
        queryKey: ["users"],
        type: "active",
      });

      // Get all users from all pages and remove the deleted one
      const allUsers: User[] = [];
      let totalCount = 0;

      queries.forEach((query) => {
        if (
          query.queryKey[0] === "users" &&
          typeof query.queryKey[1] === "number"
        ) {
          const usersData = query.state.data as UsersListResponse | undefined;
          if (usersData) {
            // Add users from this page, excluding the deleted one
            const pageUsers = usersData.data.filter(
              (user) => user.id !== deletedUserId
            );
            allUsers.push(...pageUsers);
            totalCount = usersData.total; // Get the total count
          }
        }
      });

      // Remove duplicates (in case user appears on multiple pages due to optimistic updates)
      const uniqueUsers = allUsers.filter(
        (user, index, arr) => arr.findIndex((u) => u.id === user.id) === index
      );

      // Calculate new totals
      const newTotal = Math.max(0, totalCount - 1);
      const newTotalPages = Math.ceil(newTotal / 6);

      // Redistribute users across pages (6 per page)
      const redistributedPages: { [pageNum: number]: User[] } = {};

      for (let i = 0; i < uniqueUsers.length; i++) {
        const pageNum = Math.floor(i / 6) + 1;
        if (!redistributedPages[pageNum]) {
          redistributedPages[pageNum] = [];
        }
        redistributedPages[pageNum].push(uniqueUsers[i]);
      }

      // Update all cached pages with redistributed data
      queries.forEach((query) => {
        if (
          query.queryKey[0] === "users" &&
          typeof query.queryKey[1] === "number"
        ) {
          const pageNum = query.queryKey[1] as number;
          const usersData = query.state.data as UsersListResponse | undefined;

          if (usersData) {
            // If this page should still exist with redistributed users
            if (pageNum <= newTotalPages && redistributedPages[pageNum]) {
              queryClient.setQueryData<UsersListResponse>(["users", pageNum], {
                ...usersData,
                data: redistributedPages[pageNum],
                total: newTotal,
                total_pages: newTotalPages,
              });
            } else {
              // Remove pages that no longer should exist
              queryClient.removeQueries({ queryKey: ["users", pageNum] });
            }
          }
        }
      });

      // Remove individual user query from cache
      queryClient.removeQueries({ queryKey: ["user", deletedUserId] });
    },
    onError: (error) => {
      console.error("Delete user failed:", error);
    },
  });
};

// Hook for pagination state management
export const usePagination = (initialPage: number = 1) => {
  // Use URL search params for pagination state
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current page from URL, fallback to initialPage
  const currentPage = parseInt(
    searchParams.get("page") || initialPage.toString(),
    10
  );

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      // Remove page param for page 1 to keep URL clean
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.push(newUrl);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(Math.max(1, currentPage - 1));
  };

  // Function to adjust current page if it no longer exists
  const adjustPageIfNeeded = (totalPages: number) => {
    if (currentPage > totalPages && totalPages > 0) {
      goToPage(totalPages);
    }
  };

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    adjustPageIfNeeded,
  };
};
