import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  console.log("🏠 Dashboard Layout rendered:", new Date().toISOString());
  return <div>{children}</div>;
};

export default Layout;
