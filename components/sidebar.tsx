"use client"

import { Home, Settings, PlusCircle, LogOut, Code2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useUser, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { baskerville } from "@/app/layout"

const items = [
  {
    title: "All Architectures",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Create New",
    url: "/dashboard/new",
    icon: PlusCircle,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-slate-50 dark:bg-[#050507] text-foreground dark:text-white">
      <SidebarHeader className="p-3 border-b border-border flex flex-row items-center justify-between group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <div className="w-6.5 h-6.5 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-extrabold text-xs shrink-0">
            W
          </div>
          <span className={`text-[16px] font-bold text-neutral-900 dark:text-white tracking-wide ${baskerville.className}`}>Workbench</span>
        </div>
        <SidebarTrigger className="text-foreground hover:bg-slate-200 dark:hover:bg-neutral-850 shrink-0 size-7" />
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full justify-between">
        <SidebarGroup className="p-3 group-data-[collapsible=icon]:p-2">

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center rounded-lg transition-all duration-200 group
                          ${isCollapsed ? "justify-center p-0 gap-0 w-7 h-7 mx-auto" : "gap-3 px-4 py-3 w-full"}
                          ${isActive
                            ? "bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-neutral-900 dark:text-white font-semibold shadow-inner"
                            : "text-neutral-500 dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-white/[0.02] border border-transparent"
                          }`}
                      >
                        <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 shrink-0 ${isActive ? "text-blue-500" : "text-neutral-500 dark:text-muted-foreground"}`} />
                        {!isCollapsed && <span className="text-[13px] tracking-wide">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2 border-t border-border bg-slate-50 dark:bg-[#050507] flex items-center justify-center">
        {isLoaded && user && (
          isCollapsed ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "User avatar"}
              className="w-7 h-7 rounded-full border border-slate-300 dark:border-white/10 shrink-0"
              title={user.fullName || "User profile"}
            />
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              <img
                src={user.imageUrl}
                alt={user.fullName || "User avatar"}
                className="w-8 h-8 rounded-full border border-slate-300 dark:border-white/10 shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-grow">
                <span className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate leading-none mb-1">
                  {user.fullName || "Developer"}
                </span>
                <span className="text-[9.5px] text-neutral-500 dark:text-muted-foreground truncate font-mono leading-none">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>

              <SignOutButton redirectUrl="/">
                <button
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-850 text-neutral-500 dark:text-neutral-400 hover:text-rose-650 dark:hover:text-rose-500 transition-colors shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </SignOutButton>
            </div>
          )
        )}
      </SidebarFooter>
    </Sidebar>
  )
}