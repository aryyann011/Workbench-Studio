"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/Mode/themeProvider"
import { ModeToggle } from "@/components/Mode/modeToggle"
import { Toaster } from "sonner"
import { useTheme } from "next-themes"
import { Check, AlertCircle } from "lucide-react"

function ThemeToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      icons={{
        success: (
          <Check className="h-4 w-4 text-neutral-950 dark:text-neutral-50" />
        ),
        error: <AlertCircle className="h-4 w-4 text-red-500" />,
      }}
      toastOptions={{
        className:
          "border border-border bg-background text-foreground rounded-xl shadow-lg font-sans",
      }}
    />
  )
}

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
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

  const shouldStartClosed =
    workspaceId !== undefined &&
    workspaceId !== "settings"

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeToaster />

      {isDashboardPage ? (
        <SidebarProvider
          key={pathname}
          defaultOpen={!shouldStartClosed}
        >
          <AppSidebar />

          <main className="w-full h-screen flex flex-col overflow-hidden bg-background">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-slate-50 dark:bg-[#07070a] h-12 shrink-0">
              <div className="flex items-center gap-1 select-none">
                <SidebarTrigger className="md:hidden text-foreground hover:bg-slate-200 dark:hover:bg-neutral-850 mr-1.5 size-7 shrink-0" />

                <span className="text-[13px] font-bold text-slate-500 tracking-widest">
                  Workspace
                </span>

                <span className="text-[13px] font-bold text-slate-700">
                  /
                </span>

                <span className="text-[13px] font-bold text-blue-500 dark:text-blue-400 tracking-widest">
                  {section}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <ModeToggle />
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