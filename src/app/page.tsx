import React from 'react';
import ToolsNavigation from '@/components/ToolsNavigation';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">React ToolBox</h1>
        <p className="text-xl max-w-2xl mx-auto mb-8">
          A collection of useful developer tools built with React and Next.js
        </p>
      </div>
      
      <div className="max-w-xl mx-auto bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Available Tools</h2>
        <ToolsNavigation showTitle={false} vertical={true} />
      </div>
    </main>
  );
}
