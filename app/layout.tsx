import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";

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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SidebarProvider>
          <AppSidebar />
          
          <main className="w-full h-screen flex flex-col overflow-hidden">
            
            <div className="p-2 border-b border-border flex items-center gap-2">
              <SidebarTrigger /> 
              <span className="text-sm font-medium text-muted-foreground">Workbench Studio / Untitled Project</span>
            </div>

            <div className="flex-1 overflow-hidden">
              {children}
            </div>
            
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}