import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "React ToolBox",
  description: "Collection of useful developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <div className="w-full min-h-screen flex flex-col">
            <header className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
              <div>
                <h1 className="text-2xl font-bold">
                  <a href="/" className="hover:text-blue-500 transition-colors">React ToolBox</a>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Developer tools for everyday tasks</p>
              </div>
              <ThemeToggle />
            </header>

            <div className="flex-1">
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </div>

            <footer className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-900">
              &copy; {new Date().getFullYear()} React ToolBox
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
