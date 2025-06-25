import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/data/auth/provider";
import { getAuthSession } from "@/data/auth/server-actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "User Management Dashboard",
  description: "A user management dashboard built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get server-side auth session
  const session = await getAuthSession();

  console.log("🏗️ Root Layout - Server auth check:", {
    hasSession: !!session,
    email: session?.email,
    timestamp: new Date().toISOString(),
  });

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialAuth={session}>{children}</Providers>
      </body>
    </html>
  );
}
