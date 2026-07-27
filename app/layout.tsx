import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

// Clarity project IDs are short alphanumeric tokens; validate before
// interpolating into the inline script to guard against a malformed env var.
const rawClarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const CLARITY_PROJECT_ID =
  rawClarityProjectId && /^[a-z0-9]+$/i.test(rawClarityProjectId)
    ? rawClarityProjectId
    : undefined;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-heading-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Counsel — Collins Quarters",
  description:
    "AI-assisted legal workspace for Collins Quarters clients — explain the law, prepare documents, and stay organised between conversations with your solicitor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
