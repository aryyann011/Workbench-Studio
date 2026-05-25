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
  SidebarFooter
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

  return (
    <Sidebar className="border-r border-border bg-slate-50 dark:bg-[#050507] text-foreground dark:text-white">
      <SidebarContent className="flex flex-col h-full justify-between">
        <SidebarGroup className="p-4">
          <SidebarGroupLabel
            className={`text-[20px] text-neutral-900 dark:text-white font-bold mb-6 flex items-center gap-2 ${baskerville.className}`}
          >
            <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-extrabold text-sm">
              W
            </div>
            <span>Workbench</span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group
                          ${isActive
                            ? "bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-neutral-900 dark:text-white font-semibold shadow-inner"
                            : "text-neutral-500 dark:text-muted-foreground hover:text-neutral-900 dark:hover:text-white hover:bg-slate-200/30 dark:hover:bg-white/[0.02] border border-transparent"
                          }`}
                      >
                        <span className={`flex items-center justify-center w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-blue-500" : "text-neutral-500 dark:text-muted-foreground"}`}>
                          <item.icon className="w-5 h-5" />
                        </span>
                        <span className="text-sm tracking-wide">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border bg-slate-50 dark:bg-[#050507]">
        {isLoaded && user && (
          <div className="flex items-center gap-3 w-full">
            <img
              src={user.imageUrl}
              alt={user.fullName || "User avatar"}
              className="w-9 h-9 rounded-full border border-slate-300 dark:border-white/10 shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-grow">
              <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {user.fullName || "Developer"}
              </span>
              <span className="text-[10px] text-neutral-500 dark:text-muted-foreground truncate font-mono">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>

            <SignOutButton redirectUrl="/">
              <button
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-neutral-850 text-neutral-500 dark:text-neutral-400 hover:text-rose-650 dark:hover:text-rose-500 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </SignOutButton>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}