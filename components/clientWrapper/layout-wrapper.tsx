"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { LogOut } from "lucide-react"
import { ThemeProvider } from "@/components/Mode/themeProvider"
import { ModeToggle } from "@/components/Mode/modeToggle"
import { SignOutButton } from "@clerk/nextjs"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboardPage = pathname?.startsWith("/dashboard")

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
      
            <div className="p-1.5 border-b border-border flex items-center gap-2 bg-slate-50 dark:bg-black">
              <SidebarTrigger className="text-foreground" /> 
              <span className="text-lg font-medium text-muted-foreground"></span>
              <ModeToggle/>
              <div className="fixed flex items-center gap-8 right-4">
                <SignOutButton redirectUrl="/">
                  <span className="flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-200 dark:hover:bg-neutral-850 text-neutral-750 dark:text-white cursor-pointer transition-colors text-xs font-semibold uppercase tracking-wider">
                    <LogOut className="w-4 h-4 text-neutral-600 dark:text-neutral-300"/>
                    Logout
                  </span>
                </SignOutButton>
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