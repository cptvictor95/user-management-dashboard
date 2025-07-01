import { Suspense } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Content } from "@/components/dashboard/content";

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-lg">Loading dashboard...</div>
          </div>
        }
      >
        <Content />
      </Suspense>
    </AuthGuard>
  );
}
