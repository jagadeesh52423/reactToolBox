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
          <div className="container mx-auto p-4">
            <header className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">
                  <a href="/" className="hover:text-blue-500 transition-colors">React ToolBox</a>
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Developer tools for everyday tasks</p>
              </div>
              <ThemeToggle />
            </header>

            <LayoutWrapper>
              {children}
            </LayoutWrapper>

            <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} React ToolBox
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
