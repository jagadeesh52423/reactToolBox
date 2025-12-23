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
        <div className="flex flex-col lg:flex-row h-full relative">
          {/* Sidebar */}
          <aside
            className={`
              flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
              transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'lg:w-0 lg:overflow-hidden' : 'lg:w-56'}
            `}
          >
            <div className={`${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
              <ToolsNavigation />
            </div>
          </aside>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`
              hidden lg:flex
              fixed top-20 z-50
              items-center justify-center
              w-8 h-8 rounded-r-lg
              bg-blue-500 hover:bg-blue-600 text-white
              shadow-md hover:shadow-lg
              transition-all duration-300 ease-in-out
              ${isSidebarCollapsed ? 'left-0' : 'left-56'}
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

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
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
