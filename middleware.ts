import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const isAuthenticated = !!authToken;

  console.log("🚦 Middleware:", {
    pathname: request.nextUrl.pathname,
    isAuthenticated,
    hasToken: !!authToken,
    token: authToken ? authToken.substring(0, 10) + "..." : "none",
    allCookies: request.cookies.toString(),
    timestamp: new Date().toISOString(),
  });

  const isAuthPage = request.nextUrl.pathname.startsWith("/sign-");
  const isDashboard =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/dashboard");

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    console.log("Redirecting authenticated user from auth page to dashboard");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not authenticated and trying to access protected pages, redirect to sign-in
  if (!isAuthenticated && isDashboard) {
    console.log("Redirecting unauthenticated user to sign-in");
    return NextResponse.redirect(new URL("/sign-in", request.url));
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
