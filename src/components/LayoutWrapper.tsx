'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ToolsNavigation from './ToolsNavigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <>
      {!isHomePage ? (
        <div className="flex flex-col lg:flex-row h-full">
          <aside className="lg:w-56 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            <ToolsNavigation />
          </aside>
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
