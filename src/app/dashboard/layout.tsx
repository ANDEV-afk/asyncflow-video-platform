import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

// Main dashboard layout with sidebar navigation and toolbar
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* Navigation sidebar for dashboard routes */}
        <DashboardSidebar />
        <SidebarInset>
          {/* Top navbar with user profile and notifications */}
          <Suspense fallback={null}>
            <DashboardNavbar />
          </Suspense>
          {/* Page-specific content area */}
          <div className="flex-1 p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
