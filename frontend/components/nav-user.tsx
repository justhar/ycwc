"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  Languages,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function NavUser() {
  const { user, logout } = useAuth();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("navigation");

  function handlelogOut() {
    logout();
    router.push("/signin");
  }

  function switchLanguage(locale: string) {
    // Remove current locale from pathname
    const currentLocale = pathname.startsWith("/en") ? "/en" : "/id";
    const newPath = pathname.replace(currentLocale, `/${locale}`);

    // If we're on a root page (signin/signup/landing), redirect to the locale version
    if (!pathname.startsWith("/id") && !pathname.startsWith("/en")) {
      router.push(`/${locale}${pathname}`);
    } else {
      router.push(newPath);
    }
  }

  if (!user) {
    return null;
  }

  const userData = {
    name: user.fullName,
    email: user.email,
    avatar: "", // No avatar in user object, can add later
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {userData.name && userData.name.length > 0
                    ? userData.name[0].toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {userData.name || "User"}
                </span>
                <span className="truncate text-xs">{userData.email}</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {userData.name && userData.name.length > 0
                      ? userData.name[0].toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {userData.name || "User"}
                  </span>
                  <span className="truncate text-xs">{userData.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Languages />
                  {t("language")}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => switchLanguage("en")}>
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => switchLanguage("id")}>
                      Bahasa Indonesia
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handlelogOut}>
              <LogOut />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
