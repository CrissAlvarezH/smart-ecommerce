import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import MainNavbar from "@/components/navbar/main-navbar";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const fontSans = Work_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-sans",
});

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  
  // Don't show main navbar on store client pages (they have their own navbar)
  const isStoreClientPage = pathname.match(/^\/stores\/[^\/]+\/client/) || 
                           (pathname.match(/^\/stores\/[^\/]+$/) && !pathname.includes('/admin'));

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextTopLoader />
        {modal}
        {!isStoreClientPage && <MainNavbar />}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
