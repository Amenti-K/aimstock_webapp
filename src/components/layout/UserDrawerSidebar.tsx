"use client";

import logo from "@/../public/logo.png";
import { ChevronUp, LogOut, User2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/redux/hooks";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/userAuthSlice";
import { drawerNavItems } from "@/constants/drawer";
import Image from "next/image";

import { useLanguage } from "@/hooks/language.hook";

export function UserDrawerSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user, company } = useAppSelector((state) => state.userAuth);
  const { t } = useLanguage();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-1 sm:px-2 py-6 sm:py-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:pt-4 bg-sidebar/50 backdrop-blur-sm transition-all duration-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex shrink-0 items-center justify-center transition-all duration-300 group-data-[collapsible=icon]:mx-auto">
            <Image
              src={logo}
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg transition-all duration-300 group-data-[collapsible=icon]:w-7 group-data-[collapsible=icon]:h-7"
            />
          </div>
          <div className="flex flex-col gap-0.5 overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              AIM Stock
            </span>
            <span className="text-sm font-bold text-foreground truncate leading-none whitespace-nowrap">
              {company?.name ?? "Business"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarMenu className="gap-1.5">
          {drawerNavItems.map((item: any) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={t(item.translationKey || "")}>
                <NavLink
                  to={item.href}
                  end={item.href === "/dashboard"}
                  onClick={handleNavClick}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-sidebar-accent/60 group/item"
                  activeClassName="bg-primary/10 text-primary font-semibold shadow-sm border border-primary/10"
                >
                  <item.icon className="size-4.5 transition-transform group-hover/item:scale-110" />
                  <span className="tracking-tight">
                    {t(item.translationKey || "")}
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-3">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="rounded-xl hover:bg-sidebar-accent/50 h-14"
                  >
                    <div className="flex items-center gap-3 overflow-hidden text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent text-sidebar-foreground shadow-inner">
                        <User2 className="size-5" />
                      </div>
                      <div className="grid text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-bold">{user.name}</span>
                        <span className="truncate text-xs text-muted-foreground font-medium">
                          {user.phoneNumber}
                        </span>
                      </div>
                    </div>
                    <ChevronUp className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-background p-1.5 shadow-xl border-border"
                >
                  <DropdownMenuItem
                    onClick={() => dispatch(logoutUser())}
                    className="cursor-pointer gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/5 rounded-lg py-2.5 font-medium transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span>{t("confirmLogout.title")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
