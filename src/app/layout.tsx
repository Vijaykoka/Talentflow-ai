import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentFlow AI - End-to-End Talent Fulfillment Platform",
  description: "AI-powered talent matching, demand management, and margin forecasting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans h-full antialiased relative overflow-x-hidden`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}