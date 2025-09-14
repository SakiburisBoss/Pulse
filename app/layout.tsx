import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import IframeHandshake from "@/components/IframeHandshake";

export const metadata: Metadata = {
  title: "Pulse - Modern Chat Experience",
  description: "Connect and communicate in real-time with Pulse...",
  keywords: ["chat", "realtime", "messaging", "communication"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 antialiased">
          <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
            < IframeHandshake />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
