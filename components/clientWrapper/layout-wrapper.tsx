"use client"

import * as React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { LogOut } from "lucide-react"
import { ThemeProvider } from "@/components/Mode/themeProvider"
import { ModeToggle } from "@/components/Mode/modeToggle"
import { SignOutButton } from "@clerk/nextjs"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
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
          
          {/* Header Bar */}
          <div className="p-2 border-b border-border flex items-center gap-2">
            <SidebarTrigger /> 
            <span className="text-lg font-medium text-muted-foreground"></span>
            <ModeToggle/>
            <div className="fixed flex items-center gap-8 right-0">
              <SignOutButton>
                <div className="flex items-center justify-center mr-2 cursor-pointer">
                  <LogOut className="w-5 h-5"/>
                  <button className="px-2 py-2 rounded text-white cursor-pointer">
                    Logout
                  </button>
                </div>
              </SignOutButton>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
          
        </main>
      </SidebarProvider>
    </ThemeProvider>
  )
}