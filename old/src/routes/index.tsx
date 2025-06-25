import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth-guard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

const HomePage = () => {
  return (
    <AuthGuard requireAuth={true}>
      <UserDashboard />
    </AuthGuard>
  );
};

export const Route = createFileRoute("/")({
  component: HomePage,
});
