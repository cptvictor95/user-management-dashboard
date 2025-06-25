"use client";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onNext,
  onPrevious,
}: PaginationProps) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-3 py-2"
      >
        Previous
      </Button>

      <div className="flex space-x-1">
        {getPageNumbers().map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(pageNumber)}
            className="px-3 py-2 min-w-[40px]"
          >
            {pageNumber}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!canGoNext}
        className="px-3 py-2"
      >
        Next
      </Button>
    </div>
  );
};
