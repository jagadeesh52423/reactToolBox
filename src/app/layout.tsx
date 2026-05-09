import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import LayoutWrapper from "@/components/LayoutWrapper";
import Footer from "@/components/common/Footer";
import CookieConsent from "@/components/common/CookieConsent";
import AnalyticsLoader from "@/components/common/AnalyticsLoader";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const DEFAULT_DESCRIPTION =
  "A collection of fast, privacy-friendly developer tools — JSON, text, regex, color, diagrams, and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
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

            <Footer />
          </div>
          <CookieConsent />
          <AnalyticsLoader />
        </ThemeProvider>
      </body>
    </html>
  );
}
