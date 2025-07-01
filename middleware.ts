import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const userEmail = request.cookies.get("user_email")?.value;
  const isAuthenticated = !!(authToken && userEmail);

  const { pathname } = request.nextUrl;

  console.log("🚦 Middleware:", {
    pathname,
    isAuthenticated,
    hasToken: !!authToken,
    hasEmail: !!userEmail,
    token: authToken ? authToken.substring(0, 10) + "..." : "none",
    timestamp: new Date().toISOString(),
  });

  // Define route types
  const isAuthPage = pathname.startsWith("/sign-");
  const isProtectedRoute =
    pathname === "/" || pathname.startsWith("/dashboard");

  // Handle authenticated users
  if (isAuthenticated) {
    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthPage) {
      console.log(
        "🚦 Redirecting authenticated user from auth page to dashboard"
      );
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to protected routes
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    // Allow access to auth pages
    if (isAuthPage) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users from protected routes to sign-in
    if (isProtectedRoute) {
      console.log("🚦 Redirecting unauthenticated user to sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
