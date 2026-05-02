import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stroovo – Where Work Flows Smarter",
  description: "Stroovo is an AI-powered workflow platform that helps teams manage tasks, automate processes, and work smarter.",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import FloatingAI from "@/components/FloatingAI";
import CommandPalette from "@/components/CommandPalette";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
          <CommandPalette />
          <FloatingAI />
        </AuthProvider>
      </body>
    </html>
  );
}
