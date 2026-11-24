import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { LayoutWrapper } from "@/components/clientWrapper/layout-wrapper";
import {
  geistSans,
  geistMono,
  baskerville,
  inter,
  spaceGrotesk,
} from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://workbench-studio.vercel.app"),
  title: {
    default: "Workbench Studio",
    template: "%s | Workbench Studio",
  },
  description:
    "Describe your software system in plain text and get clean, interactive architecture diagrams instantly.",
  applicationName: "Workbench Studio",
  openGraph: {
    type: "website",
    siteName: "Workbench Studio",
    title: "Workbench Studio — Architecture diagrams at the speed of thoughts",
    description:
      "Stop drawing boxes manually. Describe your architecture in plain text and watch a structured interactive diagram build itself.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workbench Studio",
    description:
      "Describe your architecture in plain text and get an interactive diagram instantly.",
  },
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
          className={`${geistSans.variable} ${geistMono.variable} ${baskerville.variable} ${inter.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
        >
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
