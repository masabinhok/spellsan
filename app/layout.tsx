import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const inter = Inter({
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: "SpellSAN - Spelling Competition Practice",
  description: "Practice spelling for the SAN spelling competition with interactive exercises and tests",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-gray-900 dark:to-slate-800`}
      >
        <Navigation />
        <main className="min-h-[calc(100vh-140px)]">
          {children}
        </main>
        <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200/30 dark:border-slate-700/30 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 SpellSAN • Practice makes perfect!
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}