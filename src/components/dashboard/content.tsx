"use client";

import { useAuth } from "@/data/auth/provider";
import { useSignOut } from "@/data/auth/hooks";
import { useUsers, usePagination } from "@/data/users/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "@/components/dashboard/user-card";
import { UserFormModal } from "@/components/dashboard/user-form-modal";
import { Pagination } from "@/components/dashboard/pagination";
import { useState } from "react";
import { ThemeToggler } from "../ui/theme-toggler";

export const Content = () => {
  console.log("🏠 Dashboard Page rendering:", new Date().toISOString());

  const { email, profile, isAuthenticated, token } = useAuth();
  const signOutMutation = useSignOut();

  // Initialize pagination to get current page
  const initialPagination = usePagination(1);

  // Get users data using current page
  const {
    data: usersData,
    isLoading,
    error,
    isPlaceholderData,
  } = useUsers(initialPagination.currentPage);

  const totalPages = usersData?.total_pages || 1;

  // Get enhanced pagination with total pages for auto-adjustment
  const { currentPage, goToPage, nextPage, prevPage } = usePagination(
    1,
    totalPages
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  console.log("🏠 Dashboard auth state:", {
    isAuthenticated,
    hasToken: !!token,
    email,
    profile,
    timestamp: new Date().toISOString(),
  });

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  const users = usersData?.data || [];

  // Only show full page loading on initial load (when there's no data at all)
  if (isLoading && !usersData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error && !usersData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">
          Error loading users:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Management Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {profile?.firstName || email || "Admin"}
              </span>
              <ThemeToggler />
              <Button
                onClick={handleSignOut}
                disabled={signOutMutation.isPending}
                variant="outline"
                size="sm"
              >
                {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {usersData?.total || 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPage}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Current Page
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalPages}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Pages
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Users{" "}
            {isPlaceholderData && (
              <span className="text-sm text-gray-500">(Loading...)</span>
            )}
          </h2>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Add New User
          </Button>
        </div>

        {/* Users Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ${
            isPlaceholderData ? "opacity-50 transition-opacity" : ""
          }`}
        >
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg">
              No users found
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
              Add First User
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
            onPrevious={prevPage}
            onNext={nextPage}
          />
        )}
      </main>

      {/* Create User Modal */}
      <UserFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
        onUserCreated={() => {
          // Navigate to first page to show the newly created user
          if (currentPage !== 1) {
            goToPage(1);
          }
        }}
      />
    </div>
  );
};
