"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/data/auth/provider";
import { useSignOut } from "@/data/auth/hooks";
import { useUsers, usePagination } from "@/data/users/hooks";
import type { User } from "@/data/users/schemas";
import { Button } from "@/components/ui/button";
import { UserCard } from "@/components/dashboard/user-card";
import { UserFormModal } from "@/components/dashboard/user-form-modal";
import { Pagination } from "@/components/dashboard/pagination";
import { AuthGuard } from "@/components/auth-guard";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import { useRouter } from "next/navigation";

export default function Home() {
  console.log("🏠 Dashboard Page rendering:", new Date().toISOString());

  const { email, profile, isAuthenticated, token } = useAuth();
  const signOutMutation = useSignOut();
  const router = useRouter();
  // Initialize pagination to get current page
  const initialPagination = usePagination(1);

  // Get users data using current page
  const {
    data: usersData,
    isLoading,
    error,
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading users...</div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-red-600">
            Error loading users: {error.message}
          </div>
        </div>
      </AuthGuard>
    );
  }

  const users = usersData?.data || [];

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold">
                  User Management Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Welcome, {profile?.firstName || email || "Admin"}
                </span>
                <Button
                  onClick={handleSignOut}
                  disabled={signOutMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
                </Button>
                <ThemeToggler />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
              Users
            </h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Add New User
            </Button>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {users.map((user: User) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg dark:text-white">
                No users found
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4"
              >
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
    </AuthGuard>
  );
}
