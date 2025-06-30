"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";

export interface PaginationState {
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

/**
 * Enhanced pagination hook with automatic page adjustment
 * No more manual adjustPageIfNeeded calls required!
 */
export const usePagination = (
  initialPage: number = 1,
  totalPages?: number
): PaginationState => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get current page from URL, fallback to initialPage
  const currentPage = parseInt(
    searchParams.get("page") || initialPage.toString(),
    10
  );

  const goToPage = useCallback(
    (page: number) => {
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
    },
    [searchParams, pathname, router]
  );

  // Automatic page adjustment when totalPages changes
  useEffect(() => {
    if (totalPages && totalPages > 0 && currentPage > totalPages) {
      // Automatically redirect to the last available page
      goToPage(totalPages);
    }
  }, [totalPages, currentPage, goToPage]);

  const nextPage = useCallback(() => {
    if (!totalPages || currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
  };
};
