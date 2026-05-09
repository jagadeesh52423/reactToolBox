import React from 'react';

interface ColorHistoryProps {
  colors: string[];
  onColorSelect: (color: string) => void;
  onClearHistory: () => void;
}

const ColorHistory: React.FC<ColorHistoryProps> = ({ colors, onColorSelect, onClearHistory }) => {
  if (colors.length === 0) {
    return (
      <div className="border dark:border-slate-700 rounded p-4 bg-gray-50 dark:bg-slate-800">
        <h3 className="text-lg font-medium mb-2 dark:text-gray-200">Color History</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Save colors to see them here</p>
      </div>
    );
  }

  return (
    <div className="border dark:border-slate-700 rounded p-4 bg-gray-50 dark:bg-slate-800">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium dark:text-gray-200">Color History</h3>
        <button
          onClick={onClearHistory}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-400 px-2 py-1 rounded"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color, index) => (
          <button 
            key={index}
            className="w-full aspect-square rounded border shadow-sm hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorHistory;
