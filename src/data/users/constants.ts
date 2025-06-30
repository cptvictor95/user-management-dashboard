export const USERS_PER_PAGE = 6;

export const QUERY_KEYS = {
  users: (page: number) => ["users", page] as const,
  user: (id: number) => ["user", id] as const,
  usersPrefix: () => ["users"] as const,
} as const;

export const CACHE_TIME = {
  staleTime: 5 * 60 * 1000, // 5 minutes
} as const;
