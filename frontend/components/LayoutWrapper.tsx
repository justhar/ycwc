"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Routes that should NOT have sidebar
const NO_SIDEBAR_ROUTES = ["/", "/auth"];

// Route to breadcrumb mapping
const ROUTE_BREADCRUMBS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "AI Chat Assistant",
  "/profile": "Profile",
  "/explore": "Explore",
  "/temp": "Temp",
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Check if current route should show sidebar
  const shouldShowSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  // Get breadcrumb title for current route
  const breadcrumbTitle = ROUTE_BREADCRUMBS[pathname] || "Page";

  // If no sidebar needed, just return children
  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  // Return layout with sidebar
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex-1 h-[calc(100vh-4rem)]">{children}</div>
      </main>
    </SidebarProvider>
  );
}