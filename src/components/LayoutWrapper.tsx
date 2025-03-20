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
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <ToolsNavigation />
          </aside>
          <main className="flex-1">
            {children}
          </main>
        </div>
      ) : (
        <main>
          {children}
        </main>
      )}
    </>
  );
};

export default LayoutWrapper;
