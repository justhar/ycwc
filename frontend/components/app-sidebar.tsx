import * as React from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  Earth,
  GalleryHorizontalEnd,
  Plus,
  Search,
  Tag,
  User,
  MessageSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroup } from "@/contexts/GroupContext";
import { useChat } from "@/contexts/ChatContext";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    color: "bg-blue-500",
  });

  const { createNewChat, chats, selectChat, currentChatId, deleteChatById } =
    useChat();
  const { groups, createGroup } = useGroup();
  const { token } = useAuth();
  const t = useTranslations("navigation");

  // Helper function to check if a route is active
  const isActive = (route: string) => {
    if (route === "/") {
      return pathname === "/";
    }
    // Check if the current path (without locale) matches the route
    const pathWithoutLocale = pathname.replace(/^\/(id|en)/, "");
    return pathWithoutLocale.startsWith(route);
  };

  // Helper function to get locale-aware href
  const getLocaleHref = (route: string) => {
    const locale = pathname.startsWith("/en") ? "/en" : "/id";
    return `${locale}${route}`;
  };

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim() || !token) return;
    await createGroup(
      {
        name: newGroup.name,
        description: newGroup.description,
        color: newGroup.color,
      },
      token
    );
    setNewGroup({ name: "", description: "", color: "bg-blue-500" });
    setShowCreateGroup(false);
  };

  const router = useRouter();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex flex-row items-center gap-1">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image
                    src="/logo.svg"
                    alt="Abroadly Logo"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-orange-500 text-lg">
                    Abroadly
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="[&::-webkit-scrollbar]:hidden">
        {/* Platform Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/profile")}>
                  <Link href={getLocaleHref("/profile")}>
                    <User />
                    {t("profile")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/match")}>
                  <Link href={getLocaleHref("/match")}>
                    <Earth />
                    {t("match")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/search")}>
                  <Link href={getLocaleHref("/search")}>
                    <Search />
                    {t("search")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tracker Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="justify-between mb-1 list-none flex">
            {t("tracker")}{" "}
            <SidebarMenuItem>
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <SidebarMenuButton asChild>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <Plus />
                      {t("createGroup")}
                    </div>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("createGroup")}</DialogTitle>
                    <DialogDescription>
                      {t("createGroupDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name ">{t("groupName")}</Label>
                      <Input
                        id="group-name"
                        value={newGroup.name}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, name: e.target.value })
                        }
                        placeholder={t("enterGroupName")}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-description">
                        {t("description")} ({t("optional")})
                      </Label>
                      <Textarea
                        id="group-description"
                        value={newGroup.description}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            description: e.target.value,
                          })
                        }
                        placeholder={t("enterGroupDescription")}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group-color">{t("color")}</Label>
                      <Select
                        value={newGroup.color}
                        onValueChange={(value) =>
                          setNewGroup({ ...newGroup, color: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bg-blue-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              {t("blue")}
                            </div>
                          </SelectItem>
                          <SelectItem value="bg-green-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              {t("green")}
                            </div>
                          </SelectItem>
                          <SelectItem value="bg-purple-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              {t("purple")}
                            </div>
                          </SelectItem>
                          <SelectItem value="bg-orange-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500" />
                              {t("orange")}
                            </div>
                          </SelectItem>
                          <SelectItem value="bg-pink-500">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-pink-500" />
                              {t("pink")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateGroup(false)}
                      >
                        {t("cancel")}
                      </Button>
                      <Button type="submit">{t("createGroup")}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/tracker"}>
                  <Link href={getLocaleHref("/tracker")}>
                    <Tag />
                    {t("allTasks")}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {groups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/tracker#${group.id}`}
                  >
                    <Link href={`/tracker#${group.id}`}>
                      <div
                        className={cn("w-3 h-3 rounded-full", group.color)}
                      />
                      {group.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat AI Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="list-none justify-between mb-1 flex">
            {t("chatAI")}{" "}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <div
                  className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={async () => {
                    try {
                      await createNewChat();
                    } catch (error) {
                      console.error("Failed to create chat:", error);
                    }
                  }}
                >
                  <Plus />
                  {t("newChat")}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <div className="flex items-center justify-between w-full group">
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "flex-1",
                        currentChatId === chat.id &&
                          isActive(`/chat`) &&
                          "bg-accent"
                      )}
                    >
                      <div
                        onClick={() => {
                          selectChat(chat.id);
                          if (pathname !== "/chat") {
                            router.push("/chat");
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="truncate">
                          {chat.title || "New Chat"}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatById(chat.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </SidebarMenuItem>
              ))}
              {chats.length === 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <MessageSquare className="w-4 h-4" />
                    {t("noChatsYet")}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
