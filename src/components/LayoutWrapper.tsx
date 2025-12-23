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

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setIsSidebarCollapsed(savedState === 'true');
    }
  }, []);

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

          {/* Mobile Sidebar */}
          <aside className="lg:hidden flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <ToolsNavigation />
          </aside>

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
