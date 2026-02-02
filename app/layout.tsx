import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { LogOut } from "lucide-react";
import { ThemeProvider } from "@/components/Mode/themeProvider";
import { ModeToggle } from "@/components/Mode/modeToggle";
import { ClerkProvider } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workbench Studio",
  description: "The Algorithmic System Design Workspace",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              
              <main className="w-full h-screen flex flex-col overflow-hidden">
                
                <div className="p-2 border-b border-border flex items-center gap-2">
                  <SidebarTrigger /> 
                  <span className="text-lg font-medium text-muted-foreground"></span>
                  <ModeToggle/>
                  <div className="fixed flex items-center gap-8 right-0">
                    <SignOutButton>
                      <div className="flex items-center justify-center mr-2 cursor-pointer">
                        <LogOut/>
                        <button className="px-2 py-2 rounded text-white cursor-pointer">
                          Logout
                        </button>
                      </div>
                    </SignOutButton>
                  </div>

                </div>

                <div className="flex-1 overflow-hidden">
                  {children}
                </div>
                
              </main>
            </SidebarProvider>
          </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
  );
}