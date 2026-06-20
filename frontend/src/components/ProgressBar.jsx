import React from 'react';

const ProgressBar = ({ progress, showLabel = false, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
  };

  const progressColor = colors[color] || colors.blue;
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-in-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
          {safeProgress}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;