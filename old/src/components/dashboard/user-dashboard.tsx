import { useState } from "react";
import { useAuth, useSignOut } from "@/data/auth/hooks";
import { useUsers, usePagination } from "@/data/users/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCard } from "./user-card";
import { UserFormModal } from "./user-form-modal";
import { Pagination } from "./pagination";

export const UserDashboard = () => {
  const { data: auth } = useAuth();
  const signOutMutation = useSignOut();
  const { currentPage, goToPage, nextPage, prevPage } = usePagination(1);
  const { data: usersData, isLoading, error } = useUsers(currentPage);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-600">Error loading users</div>
      </div>
    );
  }

  const users = usersData?.data || [];
  const totalPages = usersData?.total_pages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                User Management Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {auth?.profile?.firstName || auth?.email || "Admin"}
              </span>
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
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentPage}
                  </div>
                  <div className="text-sm text-gray-600">Current Page</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {totalPages}
                  </div>
                  <div className="text-sm text-gray-600">Total Pages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New User
          </Button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No users found</div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
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
  );
};
