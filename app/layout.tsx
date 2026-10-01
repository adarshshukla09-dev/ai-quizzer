import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { cn } from "@/lib/utils";
import Navbar from "@/components/utils/Navbar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

import AuthRedirect from "@/components/providers/AuthRedirect";

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const oxanium = Oxanium({
  subsets: ["latin"],
  variable: "--font-sans",
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
  title: "AI Quizzer",
  description:
    "An AI-powered quiz application built with Next.js, TypeScript, and tRPC which takes PDF, DOCX, or PPTX files as input and generates quizzes based on content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        oxanium.variable,
        spaceGroteskHeading.variable,
      )}
    >
      <body className="relative min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <TRPCProvider>
              {/* <AuthRedirect /> */}
              <Navbar />
              <main className="pt-12">{children}</main>
              <Toaster />
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
