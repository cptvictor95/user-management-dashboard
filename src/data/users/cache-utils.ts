import { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, USERS_PER_PAGE } from "./constants";
import type { User, UsersListResponse } from "./schemas";

/**
 * Invalidates all user-related queries for fresh data fetch
 */
export const invalidateUsersQueries = (queryClient: QueryClient) => {
  return queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.usersPrefix(),
  });
};

/**
 * Optimistically adds a user to page 1 cache
 * Falls back to invalidation if cache update becomes complex
 */
export const optimisticallyAddUser = (
  queryClient: QueryClient,
  newUser: User
) => {
  const page1Data = queryClient.getQueryData<UsersListResponse>(
    QUERY_KEYS.users(1)
  );

  if (!page1Data) {
    // No cached data, invalidate to fetch fresh
    return invalidateUsersQueries(queryClient);
  }

  // Simple case: just add to page 1 and invalidate other pages
  const updatedUsers = [newUser, ...page1Data.data].slice(0, USERS_PER_PAGE);
  const newTotal = page1Data.total + 1;
  const newTotalPages = Math.ceil(newTotal / USERS_PER_PAGE);

  queryClient.setQueryData<UsersListResponse>(QUERY_KEYS.users(1), {
    ...page1Data,
    data: updatedUsers,
    total: newTotal,
    total_pages: newTotalPages,
  });

  // Invalidate other pages to keep them fresh
  for (
    let page = 2;
    page <= Math.max(newTotalPages, page1Data.total_pages);
    page++
  ) {
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.users(page),
    });
  }
};

/**
 * Optimistically updates a user across all cached pages
 */
export const optimisticallyUpdateUser = (
  queryClient: QueryClient,
  userId: number,
  userUpdates: Partial<User>
): void => {
  // Update in list pages
  const queryCache = queryClient.getQueryCache();
  const userQueries = queryCache.findAll({
    queryKey: QUERY_KEYS.usersPrefix(),
  });

  userQueries.forEach((query) => {
    if (
      query.queryKey[0] === "users" &&
      typeof query.queryKey[1] === "number"
    ) {
      const usersData = query.state.data as UsersListResponse | undefined;
      if (usersData) {
        const updatedListData: UsersListResponse = {
          ...usersData,
          data: usersData.data.map((user) =>
            user.id === userId ? { ...user, ...userUpdates } : user
          ),
        };
        queryClient.setQueryData(query.queryKey, updatedListData);
      }
    }
  });

  // Update individual user query
  queryClient.setQueryData(
    QUERY_KEYS.user(userId),
    (oldData: { data: User } | undefined) => {
      if (oldData?.data) {
        return {
          ...oldData,
          data: { ...oldData.data, ...userUpdates },
        };
      }
      return oldData;
    }
  );
};

/**
 * Removes a user from cache and invalidates affected queries
 * Uses simple invalidation strategy for reliability
 */
export const optimisticallyRemoveUser = (
  queryClient: QueryClient,
  userId: number
) => {
  // Remove from individual user cache
  queryClient.removeQueries({ queryKey: QUERY_KEYS.user(userId) });

  // For deletion, we invalidate all user list queries to ensure consistency
  // This is simpler and more reliable than complex redistribution
  return invalidateUsersQueries(queryClient);
};
