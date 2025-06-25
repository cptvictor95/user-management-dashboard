"use client";

import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/data/auth/actions";
import { useAuth } from "@/data/auth/provider";

export default function Home() {
  const { email, profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  User Management Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your users and their information
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <p className="text-sm text-muted-foreground">Welcome back,</p>
                  <p className="font-medium text-foreground">
                    {profile?.firstName || email?.split("@")[0] || "User"}
                  </p>
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-sm text-muted-foreground">
                  Registered users
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Active Sessions
                </h3>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-sm text-muted-foreground">
                  Currently online
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  New This Week
                </h3>
                <p className="text-3xl font-bold text-primary">--</p>
                <p className="text-sm text-muted-foreground">
                  New registrations
                </p>
              </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-foreground">
                  Quick Actions
                </h2>
                <p className="text-muted-foreground">
                  Manage your users efficiently
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    disabled
                  >
                    <span className="font-medium">View All Users</span>
                    <span className="text-xs text-muted-foreground">
                      Browse user list
                    </span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    disabled
                  >
                    <span className="font-medium">Add New User</span>
                    <span className="text-xs text-muted-foreground">
                      Create user account
                    </span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    disabled
                  >
                    <span className="font-medium">User Reports</span>
                    <span className="text-xs text-muted-foreground">
                      Analytics & insights
                    </span>
                  </Button>
                  <Button
                    className="h-20 flex-col gap-2"
                    variant="outline"
                    disabled
                  >
                    <span className="font-medium">Settings</span>
                    <span className="text-xs text-muted-foreground">
                      Configure dashboard
                    </span>
                  </Button>
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-center text-muted-foreground">
                    🚧 User management features are coming soon! This dashboard
                    will be fully functional once we implement the user
                    management components.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
