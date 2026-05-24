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
  const isLandingPage = pathname?.startsWith("/landing")

  // Landing page gets a clean, sidebar-free layout
  if (isLandingPage) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar />
        
        <main className="w-full h-screen flex flex-col overflow-hidden">
    
          <div className="p-1 border-b border-border flex items-center gap-2">
            <SidebarTrigger /> 
            <span className="text-lg font-medium text-muted-foreground"></span>
            <ModeToggle/>
            <div className="fixed flex items-center gap-8 right-0">
              <SignOutButton redirectUrl="/">
                <span className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800 text-white cursor-pointer transition-colors">
                  <LogOut className="w-5 h-5"/>
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
    </ThemeProvider>
  )
}