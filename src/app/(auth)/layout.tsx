import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggler } from "@/components/ui/theme-toggler";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  console.log("🏠 Dashboard Layout rendered:", new Date().toISOString());
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggler />
      </div>
      {children}
    </ThemeProvider>
  );
};

export default Layout;
