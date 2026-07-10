'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ToolsNavigation from './ToolsNavigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Save sidebar state to localStorage when it changes
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  return (
    <>
      {!isHomePage ? (
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden fixed top-24 left-3 z-[60] flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Open tools menu"
            aria-label="Open tools menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile Off-Canvas Drawer */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-[60]">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <aside className="absolute inset-y-0 left-0 w-64 max-w-[80vw] bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto shadow-xl">
                <div className="flex justify-end p-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Close tools menu"
                    aria-label="Close tools menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ToolsNavigation />
              </aside>
            </div>
          )}

          {/* Sidebar Container */}
          <div className="relative flex-shrink-0 hidden lg:block">
            {/* Sidebar */}
            <aside
              className={`
                h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                transition-all duration-300 ease-in-out overflow-hidden
                ${isSidebarCollapsed ? 'w-0' : 'w-56'}
              `}
            >
              <div className={`w-56 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
                <ToolsNavigation />
              </div>
            </aside>

          </div>

          {/* Toggle Handle - Fixed position, centered vertically */}
          <button
            onClick={toggleSidebar}
            className={`
              hidden lg:flex
              fixed top-1/2 -translate-y-1/2
              items-center justify-center
              rounded-r-md
              border border-l-0 border-gray-300 dark:border-gray-600
              transition-all duration-200 ease-in-out
              z-50
              ${isSidebarCollapsed
                ? 'left-0 w-8 h-20 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:w-10'
                : 'left-56 w-6 h-12 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}
            `}
            title={isSidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-0' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main Content - Takes remaining width */}
          <main className="flex-1 min-w-0 overflow-auto">
            {children}
          </main>
        </div>
      ) : (
        <main className="w-full">
          {children}
        </main>
      )}
    </>
  );
};

export default LayoutWrapper;
