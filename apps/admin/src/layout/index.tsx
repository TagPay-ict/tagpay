import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <SidebarTrigger />
          <div className="text-lg font-semibold">TagPay Admin Dashboard</div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default Layout;
