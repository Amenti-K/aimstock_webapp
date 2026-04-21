"use client";

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

export function UserDrawerSidebar(
  props: React.ComponentProps<typeof Sidebar>,
) {
  const dispatch = useDispatch();
  const { user, company } = useAppSelector((state) => state.userAuth);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
          <span className="text-sm text-muted-foreground">AIM App</span>
          <span className="text-base font-semibold text-foreground">
            {company?.name ?? "Business"}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu className="gap-1">
          {drawerNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.href}
                  end={item.href === "/app/dashboard"}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-sidebar-accent/60"
                  activeClassName="bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <div className="flex items-center gap-2 overflow-hidden text-left">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground">
                        <User2 className="size-4" />
                      </div>
                      <div className="grid text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.phoneNumber}
                        </span>
                      </div>
                    </div>
                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                >
                  <DropdownMenuItem
                    onClick={() => dispatch(logoutUser())}
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-4" />
                    <span>Log out</span>
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
