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
import { useAuth } from "@/app/contexts/AuthContext";
import { useGroup } from "@/contexts/GroupContext";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Routes that should NOT have sidebar
const NO_SIDEBAR_ROUTES = ["/", "/signin", "/signup"];

// Route to breadcrumb mapping (without locale prefix)
const ROUTE_BREADCRUMBS: Record<string, string> = {
  "/chat": "chat",
  "/profile": "profile",
  "/search": "search",
  "/tracker": "tracker",
  "/match": "match",
};

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { user, token } = useAuth();
  const { loadGroups } = useGroup();
  const t = useTranslations("navigation");

  // Check if current route should show sidebar
  const shouldShowSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);

  // Load groups when user is authenticated and sidebar is shown
  useEffect(() => {
    if (user && token && shouldShowSidebar) {
      loadGroups(token);
    }
  }, [user, token, shouldShowSidebar, loadGroups]);

  // Get breadcrumb title for current route (remove locale prefix)
  const getBreadcrumbKey = (path: string) => {
    // Remove locale prefix if present
    const pathWithoutLocale = path.replace(/^\/(id|en)/, "");
    return ROUTE_BREADCRUMBS[pathWithoutLocale] || "home";
  };

  const breadcrumbKey = getBreadcrumbKey(pathname);
  const breadcrumbTitle = t(breadcrumbKey);

  // Get home link with current locale
  const getHomeLink = () => {
    if (pathname.startsWith("/en")) return "/en/profile";
    if (pathname.startsWith("/id")) return "/id/profile";
    return "/profile"; // fallback
  };

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
                  <BreadcrumbLink href={getHomeLink()}>
                    {t("home")}
                  </BreadcrumbLink>
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
