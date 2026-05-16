import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

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
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} font-poppins`} suppressHydrationWarning>
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
