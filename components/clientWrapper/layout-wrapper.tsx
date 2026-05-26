"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/Mode/themeProvider"
import { ModeToggle } from "@/components/Mode/modeToggle"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardPage = pathname?.startsWith("/dashboard")

  const pathParts = pathname?.split("/").filter(Boolean) || []
  const workspaceId = pathParts[1]

  let section = "Dashboard"
  if (workspaceId === "new") {
    section = "Create Design"
  } else if (workspaceId === "settings") {
    section = "Settings"
  } else if (workspaceId) {
    section = "Architecture Designer"
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {isDashboardPage ? (
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          
          <main className="w-full h-screen flex flex-col overflow-hidden bg-background">
      
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-[#07070a] h-12 shrink-0">
              <div className="flex items-center gap-2 select-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Workspace</span>
                <span className="text-[10px] font-bold text-slate-700">/</span>
                <span className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-widest">{section}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <ModeToggle/>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {children}
            </div>
            
          </main>
        </SidebarProvider>
      ) : (
        <div className="w-full min-h-screen bg-background">
          {children}
        </div>
      )}
    </ThemeProvider>
  )
}