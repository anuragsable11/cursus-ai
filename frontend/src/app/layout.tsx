import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BackendBanner } from "@/components/backend-banner";
import { SiteHeader } from "@/components/site-header";
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
  title: {
    default: "CURSUS AI",
    template: "%s · CURSUS AI",
  },
  description:
    "Analyze your resume, match it against job descriptions and build a learning roadmap toward an AI Engineer role.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <BackendBanner />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
          {children}
        </main>
        <footer className="border-t border-line print:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 text-xs text-ink-faint sm:px-6">
            <p>CURSUS AI · Career intelligence for aspiring AI Engineers</p>
            <p>Your profile is stored in this browser and analyzed by your local backend.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
