"use client"

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { baskerville } from "@/app/layout"

const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="p-4">
          <SidebarGroupLabel
    className={`text-[20px] dark:text-white font-bold ${baskerville.className}`}
  >Workbench Studio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="p-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="p-1">
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-5 h-5">
      <item.icon />
    </span>
                      <span className="text-lg">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}