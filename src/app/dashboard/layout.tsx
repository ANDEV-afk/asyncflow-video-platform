import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { MyVideosSearchProvider } from "@/components/videos/MyVideosSearchContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <MyVideosSearchProvider>
            <DashboardNavbar />
            <div className="flex-1 p-4 md:p-6">{children}</div>
          </MyVideosSearchProvider>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
